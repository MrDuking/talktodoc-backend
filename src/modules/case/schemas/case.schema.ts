import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type CaseStatus = 'draft' | 'pending' | 'assigned' | 'completed'

export type CaseDocument = Case & Document

@Schema({ timestamps: true })
export class Case {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient!: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Specialty', required: true })
  specialty!: Types.ObjectId

  @Prop({ type: Object, default: {} })
  medicalForm?: Record<string, any>

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointmentId?: Types.ObjectId

  @Prop({
    type: String,
    enum: ['draft', 'pending', 'assigned', 'completed'],
    default: 'draft',
  })
  status!: CaseStatus

  @Prop({ default: false })
  isDeleted!: boolean

  @Prop()
  deletedAt?: Date

  // 🆕 Danh sách đơn thuốc (offers)
  @Prop({
    type: [
      {
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: Types.ObjectId, ref: 'Doctor', required: true },
        note: { type: String },
        medications: [
          {
            medicationId: { type: Types.ObjectId, ref: 'Medicine' },
            name: String, // tên thuốc snapshot
            dosage: String, // liều dùng
            usage: String, // cách dùng
            duration: String, // thời gian
          },
        ],
      },
    ],
    default: [],
  })
  offers?: {
    createdAt: Date
    createdBy: Types.ObjectId
    note: string
    medications: {
      medicationId?: Types.ObjectId
      name?: string
      dosage?: string
      usage?: string
      duration?: string
    }[]
  }[]
}

export const CaseSchema = SchemaFactory.createForClass(Case)
