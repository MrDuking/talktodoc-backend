import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { OpenAI } from 'openai'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { ChatConversation, ChatMessage } from './schemas/chat-conversation.schema'
import { getEmbedding } from './utils/embedding.util'
import { getTopKSimilarMessages } from './utils/similarity.util'

const IMAGE_URL_REGEX = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg|bmp|tiff|tif|ico|heic|avif))/i

@Injectable()
export class ChatService {
  private openai: OpenAI
  private readonly logger = new Logger(ChatService.name)

  constructor(
    @InjectModel(ChatConversation.name)
    private readonly chatModel: Model<ChatConversation>,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    })
  }

  async createConversation(dto: CreateConversationDto): Promise<ChatConversation> {
    const conversation = new this.chatModel({
      user_id: dto.user_id,
      messages: [],
      model_used: 'gpt-3.5-turbo',
    })
    return conversation.save()
  }

  async getConversationById(id: string): Promise<ChatConversation> {
    const convo = await this.chatModel.findById(id)
    if (!convo) throw new NotFoundException('Conversation not found')
    return convo
  }

  async sendMessage(
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<{ reply: string; messages: ChatMessage[] }> {
    const convo = await this.chatModel.findById(conversationId)
    if (!convo) throw new NotFoundException('Conversation not found')
    const imageUrlsFromText = []
    let textContent = dto.message
    let match
    const regex = new RegExp(IMAGE_URL_REGEX, 'gi')
    while ((match = regex.exec(dto.message)) !== null) {
      imageUrlsFromText.push(match[0])
      textContent = textContent.replace(match[0], '').trim()
    }

    const imageUrls = [...imageUrlsFromText, ...(dto.imageUrls || [])]

    let reply = ''
    if (imageUrls.length > 0) {
      try {
        // Gửi cả text và nhiều ảnh lên OpenAI Vision
        const userContent = []
        if (textContent) {
          userContent.push({ type: 'text' as const, text: textContent })
        }
        imageUrls.forEach(url => {
          userContent.push({ type: 'image_url' as const, image_url: { url } })
        })
        const visionResponse = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                'Bạn là bác sĩ AI hỗ trợ tư vấn sức khỏe trước khám bệnh. Hãy phân tích ảnh nếu có.',
            },
            {
              role: 'user',
              content: userContent,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        })
        reply =
          visionResponse.choices[0].message.content ?? 'Xin lỗi, tôi không thể phân tích ảnh này.'
      } catch (err) {
        this.logger.error('Lỗi khi gọi OpenAI Vision API', err)
        reply =
          'Xin lỗi, hiện tại tôi chưa thể phân tích ảnh. Vui lòng thử lại sau hoặc gửi câu hỏi dạng văn bản.'
      }
      convo.messages.push({
        role: 'user',
        content: textContent,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      })
      convo.messages.push({ role: 'assistant', content: reply })
      await convo.save()
      return { reply, messages: convo.messages as ChatMessage[] }
    }

    // Nếu không có url ảnh, xử lý như cũ
    convo.messages.push({ role: 'user', content: dto.message })

    const queryEmbedding = await getEmbedding(dto.message, this.configService)

    const messageEmbeddings = await Promise.all(
      convo.messages.map(async (m, i) => ({
        index: i,
        embedding: await getEmbedding(m.content, this.configService),
      })),
    )

    const topIndexes = getTopKSimilarMessages(messageEmbeddings, queryEmbedding, 5)
    const contextMessages = topIndexes.map(i => convo.messages[i])

    const chatResponse = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `
      Bạn là một bác sĩ AI giàu kinh nghiệm, có nhiệm vụ hỗ trợ tư vấn sức khỏe sơ bộ trước khi bệnh nhân gặp bác sĩ thật.

      Bạn cần:
      - Trả lời chính xác, dễ hiểu, sử dụng ngôn ngữ phổ thông, tránh thuật ngữ chuyên môn nếu không cần thiết.
      - Gợi ý khi nào bệnh nhân nên đi khám ngay, khi nào có thể theo dõi thêm tại nhà.
      - KHÔNG đưa ra chẩn đoán hay đơn thuốc cụ thể — chỉ đưa ra lời khuyên sơ bộ.
      - Nếu có ảnh (vết thương, da liễu...), hãy mô tả ảnh một cách cẩn trọng rồi đưa ra nhận định chung.

      Trả lời ngắn gọn, rõ ràng, giới hạn độ dài dưới 100 tokens để dễ hiển thị đầy đủ trong giao diện người dùng.

      Nếu không đủ thông tin, hãy hỏi thêm để có thể hỗ trợ tốt hơn.
            `,
          },
          ...contextMessages,
          { role: 'user', content: dto.message },
        ],
        temperature: 0.7,
        max_tokens: 100,
      })


    reply = chatResponse.choices[0].message.content ?? 'Xin lỗi, tôi không thể trả lời câu hỏi này.'

    const usage = chatResponse.usage
    if (usage) {
      this.logger.log(
        `GPT token usage: input ${usage.prompt_tokens}, output ${usage.completion_tokens}, total ${usage.total_tokens}`,
      )
    }

    convo.messages.push({ role: 'assistant', content: reply })
    await convo.save()

    return { reply, messages: convo.messages as ChatMessage[] }
  }
}
