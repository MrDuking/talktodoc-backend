import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  Appointment,
  AppointmentDocument,
} from '../appointments_service/schemas/appointment.schema'
import { AnalyticsQueryDto } from './dtos/analytics-query.dto'
import { CreateRefundDto } from './dtos/create-refund.dto'
import { CreateTransactionDto } from './dtos/create-transaction.dto'
import { DoctorRevenue, DoctorRevenueDocument } from './schemas/doctor-revenue.schema'
import { RevenueAnalytics, RevenueAnalyticsDocument } from './schemas/revenue-analytics.schema'
import {
  Transaction,
  TransactionDocument,
  TransactionStatus,
  TransactionType,
} from './schemas/transaction.schema'

@Injectable()
export class TransactionAnalyticsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(DoctorRevenue.name)
    private readonly doctorRevenueModel: Model<DoctorRevenueDocument>,
    @InjectModel(RevenueAnalytics.name)
    private readonly revenueAnalyticsModel: Model<RevenueAnalyticsDocument>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
  ) {}

  // TODO: Implement CRUD, analytics, triggers, revenue calculation, refund, etc.

  async createTransaction(dto: CreateTransactionDto) {
    if (dto.appointmentId) {
      // Kiểm tra appointment tồn tại
      const appointment = await this.appointmentModel.findById(dto.appointmentId)
      if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn')
      // Chỉ cho phép thanh toán khi chưa thanh toán
      if (appointment.payment?.status === 'PAID') {
        throw new BadRequestException('Lịch hẹn đã được thanh toán')
      }
      // Tạo transaction
      const created = await this.transactionModel.create({
        ...dto,
        status: TransactionStatus.COMPLETED,
      })
      // Cập nhật trạng thái payment của appointment
      appointment.payment = {
        ...appointment.payment,
        status: 'PAID',
        paymentMethod: dto.paymentMethod || appointment.payment?.paymentMethod,
        platformFee: dto.platformFee || appointment.payment?.platformFee || 0,
        doctorFee: dto.doctorFee || appointment.payment?.doctorFee || 0,
        total: dto.amount,
        discount: appointment.payment?.discount || 0,
      }
      await appointment.save()
      return created
    }
    // Nếu không phải thanh toán cho appointment thì tạo transaction bình thường
    const created = await this.transactionModel.create({
      ...dto,
      status: TransactionStatus.COMPLETED,
    })
    return created
  }

  async createRefund(dto: CreateRefundDto) {
    // Tìm transaction gốc
    const original = await this.transactionModel.findOne({
      transactionId: dto.originalTransactionId,
    })
    if (!original) throw new NotFoundException('Không tìm thấy giao dịch gốc')
    // Nếu có appointment liên quan thì cập nhật trạng thái payment về UNPAID
    if (original.appointmentId) {
      const appointment = await this.appointmentModel.findById(original.appointmentId)
      if (appointment && appointment.payment) {
        appointment.payment.status = 'UNPAID'
        await appointment.save()
      }
    }
    // Tạo transaction refund
    const refund = await this.transactionModel.create({
      type: TransactionType.REFUND,
      amount: dto.amount,
      originalTransactionId: dto.originalTransactionId,
      netAmount: -Math.abs(dto.amount),
      status: TransactionStatus.COMPLETED,
      description: dto.reason,
      metadata: dto.metadata,
    })
    return refund
  }

  async getAnalytics(query: AnalyticsQueryDto) {
    // TODO: Tổng hợp dữ liệu analytics từ các bảng
    return {
      totalRevenue: 10000000,
      totalTransactions: 100,
      totalRefunds: 2,
      netRevenue: 9800000,
      topDoctors: [],
      paymentMethodBreakdown: [],
    }
  }
}
