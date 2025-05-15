import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ChatService } from './chat.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { ChatConversation, ChatRole } from './schemas/chat-conversation.schema'

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo cuộc hội thoại mới' })
  @ApiBody({ type: CreateConversationDto })
  @ApiResponse({ status: 201, description: 'Tạo cuộc hội thoại thành công và trả về chi tiết' })
  async createConversation(@Body() dto: CreateConversationDto): Promise<ChatConversation> {
    return this.chatService.createConversation(dto)
  }

  @Get(':conversationId')
  @ApiOperation({ summary: 'Lấy thông tin cuộc hội thoại theo ID' })
  @ApiParam({ name: 'conversationId', description: 'ID của cuộc hội thoại' })
  @ApiResponse({ status: 200, description: 'Chi tiết cuộc hội thoại, bao gồm các tin nhắn' })
  async getConversation(
    @Param('conversationId') conversationId: string,
  ): Promise<ChatConversation> {
    return this.chatService.getConversationById(conversationId)
  }

  @Post(':conversationId')
  @ApiOperation({ summary: 'Gửi tin nhắn văn bản và/hoặc hình ảnh, nhận phản hồi từ AI' })
  @ApiParam({ name: 'conversationId', description: 'ID của cuộc hội thoại' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({
    status: 200,
    description:
      'Tin nhắn đã được lưu và AI đã phản hồi. Nếu có ảnh, sẽ phân tích nội dung hình ảnh.',
  })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
  ): Promise<{ reply: string; messages: { role: ChatRole; content: string }[] }> {
    return this.chatService.sendMessage(conversationId, dto)
  }
}
