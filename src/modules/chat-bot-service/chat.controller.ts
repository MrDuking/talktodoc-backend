import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiBody({ type: CreateConversationDto })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  async createConversation(@Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(dto);
  }

  @Get(':conversationId')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @ApiParam({ name: 'conversationId', description: 'ID of the conversation' })
  async getConversation(@Param('conversationId') conversationId: string) {
    return this.chatService.getConversationById(conversationId);
  }

  @Post(':conversationId')
  @ApiOperation({ summary: 'Send a message and receive AI response' })
  @ApiParam({ name: 'conversationId', description: 'ID of the conversation' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, description: 'Message processed and AI replied' })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto
  ) {
    return this.chatService.sendMessage(conversationId, dto);
  }
}
