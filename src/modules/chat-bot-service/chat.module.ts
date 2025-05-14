import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatConversation, ChatConversationSchema } from './schemas/chat-conversation.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatConversation.name, schema: ChatConversationSchema }]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
