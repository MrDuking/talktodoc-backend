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

// ------------------ Doctor Schema ------------------
@Schema({ timestamps: true })
export class Doctor extends BaseUser {
  @Prop({ unique: true })
  id!: string

  @Prop({ default: UserRole.DOCTOR })
  role!: UserRole

  @Prop({ type: [Types.ObjectId], required: true, ref: 'Specialty' })
  specialty!: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, required: true, ref: 'Hospital' })
  hospital!: Types.ObjectId

  @Prop({ default: 0 })
  experienceYears!: number

  @Prop()
  licenseNo!: string

  @Prop({ type: [Availability], default: [] })
  availability!: Availability[]

  @Prop({ type: Types.ObjectId, required: true, ref: 'DoctorLevel' })
  rank!: Types.ObjectId

  @Prop({ type: String, required: false })
  position?: string

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
