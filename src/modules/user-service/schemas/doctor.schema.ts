import { UserRole } from '@common/enum/user_role.enum'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Model, Types } from 'mongoose'
import { BaseUser } from './base-user.schema'

export enum DoctorRegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UPDATING = 'updating',
}

export type DoctorDocument = Doctor & Document
export type DoctorModel = Model<DoctorDocument>

// ------------------ Availability Schema ------------------
@Schema()
class TimeSlot {
  @Prop({ required: true })
  index!: number // thứ tự trong ngày (ca 1, ca 2...)

  @Prop({ required: true })
  timeStart!: string // "08:00"

  @Prop({ required: true })
  timeEnd!: string // "12:00"
}

@Schema()
class Availability {
  @Prop({ required: false })
  dayOfWeek?: number // 0 = Chủ nhật, 1 = Thứ hai, ..., 6 = Thứ bảy

  @Prop({ type: [TimeSlot], default: [] })
  timeSlot!: TimeSlot[]
}
@Schema()
class Wallet {
  @Prop({ type: Number, required: false, default: 0 })
  balance?: number

  @Prop({
    type: [
      {
        amount: Number,
        type: { type: String, enum: ['DEPOSIT', 'WITHDRAW', 'REFUND'] },
        description: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  transactionHistory?: {
    amount: number
    type: 'DEPOSIT' | 'WITHDRAW' | 'REFUND'
    description: string
    createdAt: Date
  }[]

  @Prop({ type: Date, default: Date.now })
  lastUpdated?: Date
}
@Schema()
class RegistrationForm {
  @Prop({ required: false, default: '' })
  practicingCertificate!: string

  @Prop({ required: false, default: '' })
  degree!: string

  @Prop({ required: false, default: '' })
  cv!: string

  @Prop({ type: [String], default: [] })
  otherCertificates?: string[]

  @Prop({ type: Date, default: Date.now })
  submittedAt!: Date
}

// ------------------ Doctor Schema ------------------
@Schema({ timestamps: true })
export class Doctor extends BaseUser {
  @Prop({ unique: true })
  id!: string

  @Prop({ default: UserRole.DOCTOR })
  role!: UserRole

  @Prop({ type: [Types.ObjectId], required: false, ref: 'Specialty' })
  specialty!: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, required: false, ref: 'Hospital' })
  hospital!: Types.ObjectId

  @Prop({ default: 0 })
  experienceYears!: number

  @Prop()
  licenseNo!: string

  @Prop({ type: [Availability], default: [] })
  availability!: Availability[]

  @Prop({ type: Types.ObjectId, required: false, ref: 'DoctorLevel' })
  rank!: Types.ObjectId

  @Prop({ type: String, required: false })
  position?: string

  @Prop({ type: Number, required: false, default: 10 })
  performanceScore?: number

  @Prop({
    type: [
      {
        ratingScore: Number,
        description: String,
        appointmentId: { type: Types.ObjectId },
      },
    ],
    default: [],
  })
  ratingDetails!: {
    ratingScore: number
    description?: string
    appointmentId?: Types.ObjectId
  }[]

  @Prop({ default: 0 })
  avgScore!: number

  @Prop({
    type: String,
    enum: DoctorRegistrationStatus,
    required: false,
    default: DoctorRegistrationStatus.PENDING,
  })
  registrationStatus?: DoctorRegistrationStatus

  @Prop({ type: Date, required: false, default: new Date() })
  lastLoggedIn?: Date

  @Prop({ type: RegistrationForm })
  registrationForm?: RegistrationForm

  @Prop({
    type: Wallet,
    default: {
      balance: 0,
      transactionHistory: [],
      lastUpdated: new Date(),
    },
  })
  wallet?: Wallet

  @Prop({
    type: [
      {
        appointmentId: { type: Types.ObjectId, ref: 'Appointment' },
        score: Number,
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  performanceScoreLogs?: {
    appointmentId: Types.ObjectId
    appointment: string
    score: number
    reason: string
    createdAt: Date
  }[]
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor)

// ------------------ Generate unique DRxxxxxx ID ------------------
DoctorSchema.pre<DoctorDocument>('save', async function (next) {
  if (!this.id) {
    let uniqueId
    let isUnique = false
    const DoctorModel = this.constructor as DoctorModel

    while (!isUnique) {
      uniqueId = `DR${Math.floor(100000 + Math.random() * 900000)}`
      const existing = await DoctorModel.findOne({ id: uniqueId })
      if (!existing) {
        isUnique = true
      }
    }

    this.id = uniqueId
  }
  next()
})
