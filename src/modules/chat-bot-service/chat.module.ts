import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppointmentModule } from '../appointments_service/appointment.module'
import { UsersModule } from '../user-service/user.module'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatConversation, ChatConversationSchema } from './schemas/chat-conversation.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatConversation.name, schema: ChatConversationSchema }]),
    AppointmentModule,
    UsersModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
