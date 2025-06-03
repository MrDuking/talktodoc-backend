import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type DoctorRevenueDocument = DoctorRevenue & Document

@Schema({ timestamps: true })
export class DoctorRevenue {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId!: Types.ObjectId

  @Prop({ required: true })
  period!: string // 'YYYY-MM' for monthly tracking

  // Revenue metrics
  @Prop({ default: 0 })
  totalEarnings!: number

  @Prop({ default: 0 })
  totalCommissions!: number

  @Prop({ default: 0 })
  netIncome!: number

  @Prop({ default: 0 })
  totalConsultations!: number

  @Prop({ default: 0 })
  totalAppointments!: number

  @Prop({ default: 0 })
  averageConsultationFee!: number

  // Detailed breakdown
  @Prop({ default: 0 })
  appointmentRevenue!: number

  @Prop({ default: 0 })
  consultationRevenue!: number

  @Prop({ default: 0 })
  bonusRevenue!: number

  @Prop({ default: 0 })
  refundAmount!: number

  // Payment status
  @Prop({ default: 0 })
  paidAmount!: number

  @Prop({ default: 0 })
  pendingAmount!: number

  @Prop()
  lastPaidAt?: Date
}

export const DoctorRevenueSchema = SchemaFactory.createForClass(DoctorRevenue)
