import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { OpenAI } from 'openai'
import { AppointmentService } from '../appointments_service/appointment.service'
import { Appointment } from '../appointments_service/schemas/appointment.schema'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { Patient } from '../user-service/schemas/patient.schema'
import { UsersService } from '../user-service/user.service'
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
    private readonly appointmentService: AppointmentService,
    private readonly usersService: UsersService,
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
      context: dto.context || {},
    })
    return conversation.save()
  }

  async getConversationById(id: string): Promise<ChatConversation> {
    const convo = await this.chatModel.findById(id)
    if (!convo) throw new NotFoundException('Cuộc hội thoại không tồn tại')
    return convo
  }

  async sendMessage(
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<{ reply: string; messages: ChatMessage[] }> {
    const convo = await this.chatModel.findById(conversationId)
    if (!convo) throw new NotFoundException('Cuộc hội thoại không tồn tại')

    // Query patient info & appointments
    let patientInfo: Patient | null = null
    let appointments: Appointment[] = []
    console.log('convo.user_id', convo)
    if (convo.user_id) {
      try {
        console.log('convo.user_id', convo.user_id)
        patientInfo = await this.usersService.getPatientById(convo.user_id)
      } catch (err) {
        this.logger.warn('Không lấy được thông tin bệnh nhân', err)
      }
      console.log('patientInfo', patientInfo)
      try {
        const jwtPayload: JwtPayload = {
          userId: convo.user_id,
          username: patientInfo?.username || '',
          role: 'PATIENT',
        }
        const apptResult = await this.appointmentService.findAppointments(
          jwtPayload,
          undefined,
          1,
          3,
        )
        appointments = apptResult.data || []
      } catch (err) {
        this.logger.warn('Không lấy được lịch hẹn', err)
      }
    }
    // Merge context
    const context = {
      ...(convo.context && typeof convo.context === 'object' ? convo.context : {}),
      patient: patientInfo
        ? {
            fullName: patientInfo.fullName,
            gender: patientInfo.gender,
            birthDate: patientInfo.birthDate,
            phoneNumber: patientInfo.phoneNumber,
            medicalHistory: patientInfo.medicalHistory || [],
          }
        : undefined,
      appointments: Array.isArray(appointments)
        ? appointments.map(a => {
            let doctorName = ''
            const doc = a.doctor as unknown
            if (doc && typeof doc === 'object' && (doc as { fullName?: string }).fullName) {
              doctorName = (doc as { fullName: string }).fullName
            }
            return {
              date: a.date,
              doctor: doctorName,
              reason: a.reason,
              status: a.status,
              note: a.doctorNote,
            }
          })
        : [],
    }

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
                'Bạn là trợ lý AI TalkToDoc. Phân tích ảnh nếu có và hỗ trợ bệnh nhân một cách an toàn, không chẩn đoán.',
            },
            {
              role: 'user',
              content: userContent,
            },
          ],
          temperature: 0.6,
          max_tokens: 600,
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

    const contextualInfo = context.patient
      ? `Thông tin bệnh nhân: ${JSON.stringify(context.patient)}.\nLịch sử khám: ${JSON.stringify(context.appointments)}.`
      : 'Không có thông tin bệnh nhân cụ thể.'

    const chatResponse = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `
Bạn là trợ lý AI TalkToDoc, hỗ trợ tư vấn sức khỏe sơ bộ.
- KHÔNG chẩn đoán hay kê đơn.
- KHÔNG đưa ra lời khuyên nguy hiểm.
- Hãy gợi ý gặp bác sĩ khi cần.
- Trả lời bằng tiếng Việt đơn giản, dễ hiểu, sử dụng **Markdown chuẩn** nếu cần xuống dòng, danh sách, in đậm, in nghiêng.
- Ví dụ:
  - Gạch đầu dòng: \`- Gợi ý 1\`
  - In đậm: \`**Lưu ý**\`
  - Dòng mới: dùng \\n\\n
- Nếu thiếu thông tin, hãy hỏi lại.
- Nếu có thông tin bệnh nhân, hãy sử dụng nó để trả lời.

${contextualInfo}
          `.trim(),
        },
        ...contextMessages,
        { role: 'user', content: dto.message },
      ],
      temperature: 0.6,
      max_tokens: 600,
    })

    reply = chatResponse.choices[0].message.content ?? 'Xin lỗi, tôi không thể trả lời câu hỏi này.'

    // Guard: không cho trả lời vượt giới hạn
    if (reply.match(/\b(bạn bị|tôi nghĩ bạn mắc|bạn nên uống|bạn có thể dùng)\b/i)) {
      reply =
        'Xin lỗi, tôi không thể đưa ra chẩn đoán hay kê đơn. Vui lòng gặp bác sĩ để được tư vấn cụ thể.'
    }

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
