import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type TransactionDocument = Transaction & Document

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  COMMISSION = 'COMMISSION',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, unique: true })
  transactionId!: string

  @Prop({ required: true, enum: TransactionType })
  type!: TransactionType

  @Prop({ required: true })
  amount!: number

  @Prop({ default: 'VND' })
  currency!: string

  @Prop({ required: true, enum: TransactionStatus })
  status!: TransactionStatus

  // Liên kết
  @Prop({ type: Types.ObjectId, ref: 'User' })
  patientId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User' })
  doctorId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointmentId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Case' })
  caseId?: Types.ObjectId

  @Prop()
  orderId?: string

  // Payment details
  @Prop()
  paymentMethod?: string

  @Prop()
  paymentGatewayId?: string

  @Prop({ default: 0 })
  platformFee!: number

  @Prop({ default: 0 })
  doctorFee!: number

  @Prop({ default: 0 })
  commission!: number

  // Refund/Offset handling
  @Prop()
  originalTransactionId?: string

  @Prop({ type: [String], default: [] })
  offsetTransactionIds?: string[]

  @Prop({ required: true })
  netAmount!: number

  // Metadata
  @Prop()
  description!: string

  @Prop({ type: Object })
  metadata?: Record<string, any>

  @Prop()
  processedAt?: Date
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction)
