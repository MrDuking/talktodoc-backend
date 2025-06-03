import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type RevenueAnalyticsDocument = RevenueAnalytics & Document

export type TopDoctorByRevenue = {
  doctorId: string
  revenue: number
  consultations: number
}

export type PaymentMethodBreakdown = {
  method: string
  amount: number
  count: number
}

@Schema({ timestamps: true })
export class RevenueAnalytics {
  @Prop({ required: true })
  period!: string // 'YYYY-MM-DD', 'YYYY-MM', 'YYYY'

  @Prop({ required: true, enum: ['DAILY', 'MONTHLY', 'YEARLY'] })
  periodType!: 'DAILY' | 'MONTHLY' | 'YEARLY'

  // Platform metrics
  @Prop({ default: 0 })
  totalRevenue!: number

  @Prop({ default: 0 })
  totalCommissions!: number

  @Prop({ default: 0 })
  totalRefunds!: number

  @Prop({ default: 0 })
  netRevenue!: number

  // Transaction counts
  @Prop({ default: 0 })
  totalTransactions!: number

  @Prop({ default: 0 })
  successfulTransactions!: number

  @Prop({ default: 0 })
  failedTransactions!: number

  @Prop({ default: 0 })
  refundTransactions!: number

  // Doctor metrics
  @Prop({ default: 0 })
  activeDoctors!: number

  @Prop({ type: [{ doctorId: String, revenue: Number, consultations: Number }], default: [] })
  topDoctorsByRevenue!: TopDoctorByRevenue[]

  // Payment method breakdown
  @Prop({ type: [{ method: String, amount: Number, count: Number }], default: [] })
  paymentMethodBreakdown!: PaymentMethodBreakdown[]
}

export const RevenueAnalyticsSchema = SchemaFactory.createForClass(RevenueAnalytics)
