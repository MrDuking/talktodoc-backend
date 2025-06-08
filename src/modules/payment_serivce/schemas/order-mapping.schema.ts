import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class OrderMapping extends Document {
  @Prop({ required: true, unique: true })
  orderId!: string

  @Prop({ required: true })
  patient!: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  })
  doctorId?: Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  })
  appointmentId?: Types.ObjectId

  @Prop({ required: true })
  amount!: number

  @Prop({ required: true, enum: ['pending', 'completed', 'failed'] })
  status!: string

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date

  @Prop()
  completedAt?: Date

  @Prop({ type: Boolean, default: false })
  salaryStatus?: boolean
}

export const OrderMappingSchema = SchemaFactory.createForClass(OrderMapping)
