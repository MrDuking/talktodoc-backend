import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class Appointment extends Document {
  @Prop({ required: true, unique: true })
  appointmentId!: string

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient!: Types.ObjectId | any

  @Prop({ type: Types.ObjectId, ref: 'Doctor' })
  doctor!: Types.ObjectId | any

  @Prop({ type: Types.ObjectId, ref: 'Speciality', required: true })
  specialty!: Types.ObjectId | any

  @Prop({})
  date!: string

  @Prop({})
  slot!: string

  @Prop({ default: 'Asia/Ho_Chi_Minh' })
  timezone!: string

  @Prop({ type: Object })
  medicalForm?: Record<string, any>

  @Prop({
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING',
  })
  status!: string

  @Prop()
  confirmedAt?: Date

  @Prop()
  cancelledAt?: Date

  @Prop()
  doctorNote?: string

  @Prop({
    type: Object,
    default: {
      platformFee: 0,
      doctorFee: 0,
      discount: 0,
      total: 0,
      status: 'UNPAID',
      paymentMethod: '',
    },
  })
  payment?: {
    platformFee: number
    doctorFee: number
    discount: number
    total: number
    status: string
    paymentMethod?: string
  }

  @Prop()
  notes?: string
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment)
