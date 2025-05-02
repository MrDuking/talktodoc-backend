import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatRole = 'user' | 'assistant';

@Schema({ collection: 'chat_conversations', timestamps: true })
export class ChatConversation extends Document {
  @Prop({ required: true })
  user_id!: string;

  @Prop({
    type: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
      },
    ],
    required: true,
  })
  messages!: { role: ChatRole; content: string }[];

  @Prop()
  model_used?: string;

  @Prop()
  topic?: string;
}

export const ChatConversationSchema = SchemaFactory.createForClass(ChatConversation);