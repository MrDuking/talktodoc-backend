import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class OrderMapping extends Document {
  @Prop({ required: true, unique: true })
  orderId!: string

  @Prop({ required: true })
  patient!: string

  @Prop()
  doctorId?: string

  @Prop()
  appointmentId?: string

  @Prop({ required: true })
  amount!: number

  @Prop({ required: true, enum: ['pending', 'completed', 'failed'] })
  status!: string

  @Prop({ required: true })
  createdAt!: Date

  @Prop()
  completedAt?: Date
}

export const OrderMappingSchema = SchemaFactory.createForClass(OrderMapping)
