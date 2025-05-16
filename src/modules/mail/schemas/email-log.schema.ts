import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class EmailLog extends Document {
  @Prop({ required: true })
  to!: string

  @Prop({ required: true })
  subject!: string

  @Prop()
  html?: string

  @Prop({ default: true })
  success!: boolean

  @Prop()
  errorMessage?: string
}

export const EmailLogSchema = SchemaFactory.createForClass(EmailLog)
