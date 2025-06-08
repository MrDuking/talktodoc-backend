import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
  imageUrls?: string[]
}

@Schema({ collection: 'chat_conversations', timestamps: true })
export class ChatConversation extends Document {
  @Prop({ required: true })
  user_id!: string

  @Prop({
    type: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        imageUrls: { type: [String], default: [] },
      },
    ],
    required: true,
  })
  messages!: ChatMessage[]

  @Prop()
  model_used?: string

  @Prop()
  topic?: string

  @Prop({ type: Object, default: {} })
  context?: Record<string, unknown>
}

export const ChatConversationSchema = SchemaFactory.createForClass(ChatConversation)
