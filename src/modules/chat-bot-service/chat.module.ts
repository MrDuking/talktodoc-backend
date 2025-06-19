import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppointmentModule } from '../appointments_service/appointment.module'
import { CaseModule } from '../case/case.module'
import { SpecialtyModule } from '../specialty_service/specialty.module'
import { UsersModule } from '../user-service/user.module'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatConversation, ChatConversationSchema } from './schemas/chat-conversation.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatConversation.name, schema: ChatConversationSchema }]),
    AppointmentModule,
    UsersModule,
    CaseModule,
    SpecialtyModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
