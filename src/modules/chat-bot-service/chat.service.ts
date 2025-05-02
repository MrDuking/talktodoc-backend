import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatConversation } from './schemas/chat-conversation.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { getEmbedding } from './utils/embedding.util';
import { getTopKSimilarMessages } from './utils/similarity.util';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  private openai: OpenAI;
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatConversation.name)
    private readonly chatModel: Model<ChatConversation>,
    private readonly configService: ConfigService
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY')
    });
  }

  async createConversation(dto: CreateConversationDto) {
    const conversation = new this.chatModel({
      user_id: dto.user_id,
      messages: [],
      model_used: 'gpt-3.5-turbo',
    });
    return conversation.save();
  }

  async getConversationById(id: string) {
    const convo = await this.chatModel.findById(id);
    if (!convo) throw new NotFoundException('Conversation not found');
    return convo;
  }

  async sendMessage(conversationId: string, dto: SendMessageDto) {
    const convo = await this.chatModel.findById(conversationId);
    if (!convo) throw new NotFoundException('Conversation not found');

    convo.messages.push({ role: 'user', content: dto.message });

    const queryEmbedding = await getEmbedding(dto.message, this.configService);

    const messageEmbeddings = await Promise.all(
      convo.messages.map(async (m, i) => ({
        index: i,
        embedding: await getEmbedding(m.content, this.configService),
      }))
    );

    const topIndexes = getTopKSimilarMessages(messageEmbeddings, queryEmbedding, 5);
    const contextMessages = topIndexes.map((i) => convo.messages[i]);

    const chatResponse = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Bạn là bác sĩ AI hỗ trợ tư vấn sức khỏe trước khám bệnh.' },
        ...contextMessages,
        { role: 'user', content: dto.message }
      ],
      temperature: 0.7,
      max_tokens: 50
    });

    const reply = chatResponse.choices[0].message.content ?? 'Xin lỗi, tôi không thể trả lời câu hỏi này.';

    const usage = chatResponse.usage;
    if (usage) {
      this.logger.log(`GPT token usage: input ${usage.prompt_tokens}, output ${usage.completion_tokens}, total ${usage.total_tokens}`);
    }

    convo.messages.push({ role: 'assistant', content: reply });
    await convo.save();

    return { reply, messages: convo.messages };
  }
}