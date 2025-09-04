import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ChatService } from './chat.service'
import { GetConversationsResponseDto } from './dto/conversation-response.dto'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { GetConversationsDto } from './dto/get-conversations.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { UpdateConversationDto } from './dto/update-conversation.dto'
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

  @Patch(':conversationId/model')
  @ApiOperation({ summary: 'Đổi model AI cho cuộc hội thoại hiện tại' })
  @ApiParam({ name: 'conversationId', description: 'ID của cuộc hội thoại' })
  @ApiBody({ schema: { properties: { model: { type: 'string', example: 'gpt-4o' } } } })
  @ApiResponse({ status: 200, description: 'Đổi model thành công' })
  async switchModel(
    @Param('conversationId') conversationId: string,
    @Body('model') model: string,
  ): Promise<ChatConversation> {
    return this.chatService.switchModel(conversationId, model)
  }

  // Sidebar API Endpoints
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách conversations cho sidebar' })
  @ApiQuery({ name: 'user_id', required: false, description: 'ID của user' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (default: 1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số items per page (default: 20, max: 100)',
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type (ai | doctor)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search trong title và last_message' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách conversations với pagination',
    type: GetConversationsResponseDto,
  })
  async getConversations(@Query() dto: GetConversationsDto): Promise<GetConversationsResponseDto> {
    return this.chatService.getConversations(dto)
  }

  @Patch(':conversationId/read')
  @ApiOperation({ summary: 'Đánh dấu conversation đã đọc' })
  @ApiParam({ name: 'conversationId', description: 'ID của conversation' })
  @ApiResponse({ status: 200, description: 'Đánh dấu đã đọc thành công' })
  async markAsRead(
    @Param('conversationId') conversationId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.chatService.markConversationAsRead(conversationId)
  }

  @Delete(':conversationId')
  @ApiOperation({ summary: 'Xóa conversation' })
  @ApiParam({ name: 'conversationId', description: 'ID của conversation' })
  @ApiResponse({ status: 200, description: 'Xóa conversation thành công' })
  async deleteConversation(
    @Param('conversationId') conversationId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.chatService.deleteConversation(conversationId)
  }

  @Patch(':conversationId')
  @ApiOperation({ summary: 'Cập nhật thông tin conversation' })
  @ApiParam({ name: 'conversationId', description: 'ID của conversation' })
  @ApiBody({ type: UpdateConversationDto })
  @ApiResponse({ status: 200, description: 'Cập nhật conversation thành công' })
  async updateConversation(
    @Param('conversationId') conversationId: string,
    @Body() dto: UpdateConversationDto,
  ): Promise<ChatConversation> {
    return this.chatService.updateConversation(conversationId, dto)
  }
}
