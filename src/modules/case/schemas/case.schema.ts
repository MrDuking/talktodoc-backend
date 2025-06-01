import { BadRequestException } from '@nestjs/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type CaseStatus = 'draft' | 'pending' | 'assigned' | 'completed' | 'cancelled'

export interface OfferSummary {
  date: string
  doctor: string
  summary: string
}

export interface MedicalFormType {
  symptoms?: string
  questions?: Array<{ question: string; answer: string }>
  note?: string
  diagnosis?: string
  treatment?: string
  followup?: string
  [key: string]: unknown
}

export interface CaseDocument extends Case, Document {
  offerSummary?: OfferSummary[]
}

@Schema({ timestamps: true })
export class Case {
  @Prop({ type: String, unique: true, required: true })
  caseId!: string

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient!: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Specialty', required: true })
  specialty!: Types.ObjectId

  @Prop({ type: Object, default: {} })
  medicalForm?: MedicalFormType

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointmentId?: Types.ObjectId

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
        pharmacyId: { type: Types.ObjectId, ref: 'Pharmacy' },
        shippingAddress: { type: String },
        shippingPhone: { type: String },
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
    pharmacyId?: Types.ObjectId
    shippingAddress?: string
    shippingPhone?: string
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

// Tạo index unique cho caseId
CaseSchema.index({ caseId: 1 }, { unique: true })

// Function để generate caseId unique
export function generateCaseId(): string {
  const randomNum = Math.floor(Math.random() * 10000000) // 0 đến 9999999
  return `CA-${randomNum.toString().padStart(7, '0')}` // Pad với số 0 phía trước
}

export function validateObjectIdOrThrow(id: string, label = 'ID'): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`${label} không hợp lệ`)
  }
}
