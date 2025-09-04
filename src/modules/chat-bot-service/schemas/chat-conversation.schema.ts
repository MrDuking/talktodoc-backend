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

  @Prop({ required: true, default: 'AI - gpt-3.5-turbo' })
  title!: string

  @Prop({ required: true, enum: ['ai', 'doctor'], default: 'ai' })
  type!: 'ai' | 'doctor'

  @Prop()
  model_used?: string

  @Prop()
  last_message?: string

  @Prop({ default: 0 })
  unread_count!: number

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
  topic?: string

  @Prop({ type: Object, default: {} })
  context?: Record<string, unknown>
}

export const ChatConversationSchema = SchemaFactory.createForClass(ChatConversation)
