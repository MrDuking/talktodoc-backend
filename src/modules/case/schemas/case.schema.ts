import { BadRequestException } from '@nestjs/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type CaseStatus = 'draft' | 'pending' | 'assigned' | 'completed' | 'cancelled'

export interface OfferSummary {
  date: string
  doctor: string
  summary: string
}

export interface CaseDocument extends Case, Document {
  offerSummary?: OfferSummary[]
}

@Schema({ timestamps: true })
export class Case {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient!: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Specialty', required: true })
  specialty!: Types.ObjectId

  @Prop({ type: Object, default: {} })
  medicalForm?: Record<string, any>

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointmentId?: Types.ObjectId | any

  @Prop({
    type: String,
    enum: ['draft', 'pending', 'assigned', 'completed', 'cancelled'],
    default: 'draft',
  })
  status!: CaseStatus

  @Prop({ default: false })
  isDeleted!: boolean

  @Prop()
  deletedAt?: Date

  // Danh sách đơn thuốc (offers)
  @Prop({
    type: [
      {
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: Types.ObjectId, ref: 'Doctor', required: true },
        note: { type: String },
        medications: [
          {
            medicationId: { type: Types.ObjectId, ref: 'Medicine' },
            name: String,
            dosage: String,
            usage: String,
            duration: String,
            price: Number,
            quantity: Number,
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
      price?: number
      quantity?: number
    }[]
  }[]
}

export const CaseSchema = SchemaFactory.createForClass(Case)

function validateObjectIdOrThrow(id: string, label = 'ID') {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`${label} không hợp lệ`)
  }
}
