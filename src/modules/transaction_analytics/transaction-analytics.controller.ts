import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AnalyticsQueryDto } from './dtos/analytics-query.dto'
import { CreateRefundDto } from './dtos/create-refund.dto'
import { CreateTransactionDto } from './dtos/create-transaction.dto'
import { TransactionAnalyticsService } from './transaction-analytics.service'

@ApiTags('Transaction Analytics')
@Controller('transaction-analytics')
export class TransactionAnalyticsController {
  constructor(private readonly transactionAnalyticsService: TransactionAnalyticsService) {}

  @ApiOperation({ summary: 'Tạo giao dịch mới' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'Tạo giao dịch thành công.' })
  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  async createTransaction(@Body() dto: CreateTransactionDto) {
    const data = await this.transactionAnalyticsService.createTransaction(dto)
    return { message: 'Tạo giao dịch thành công', data, status: 201 }
  }

  @ApiOperation({ summary: 'Tạo giao dịch hoàn tiền (refund)' })
  @ApiBody({ type: CreateRefundDto })
  @ApiResponse({ status: 201, description: 'Tạo giao dịch hoàn tiền thành công.' })
  @Post('refund')
  @HttpCode(HttpStatus.CREATED)
  async createRefund(@Body() dto: CreateRefundDto) {
    const data = await this.transactionAnalyticsService.createRefund(dto)
    return { message: 'Tạo giao dịch hoàn tiền thành công', data, status: 201 }
  }

  @ApiOperation({ summary: 'Lấy analytics tổng quan (doanh thu, giao dịch, v.v.)' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Khoảng thời gian (YYYY-MM-DD, YYYY-MM, YYYY)',
  })
  @ApiQuery({ name: 'periodType', required: false, enum: ['DAILY', 'MONTHLY', 'YEARLY'] })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Lọc theo bác sĩ' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Lọc theo bệnh nhân' })
  @ApiResponse({ status: 200, description: 'Analytics tổng quan.' })
  @Get('analytics')
  async getAnalytics(@Query() query: AnalyticsQueryDto) {
    const data = await this.transactionAnalyticsService.getAnalytics(query)
    return { message: 'Thành công', data, status: 200 }
  }

  @ApiOperation({ summary: '[TEST] Tạo giao dịch thanh toán mẫu (test)' })
  @ApiResponse({ status: 201, description: 'Tạo giao dịch test thành công.' })
  @Post('test-payment')
  @HttpCode(HttpStatus.CREATED)
  async testPayment() {
    // Dữ liệu mẫu, cần thay bằng _id thực tế trong DB để test thật
    const dto = {
      type: 'PAYMENT',
      amount: 300000,
      currency: 'VND',
      patientId: '664b1e2f2f8b2c001e7e7e7d',
      doctorId: '664b1e2f2f8b2c001e7e7e81',
      appointmentId: '664b1e2f2f8b2c001e7e7e80',
      paymentMethod: 'VNPAY',
      platformFee: 50000,
      doctorFee: 250000,
      commission: 0,
      netAmount: 300000,
      description: 'Thanh toán lịch hẹn test',
    }
    const data = await this.transactionAnalyticsService.createTransaction(dto as any)
    return { message: 'Tạo giao dịch test thành công', data, status: 201 }
  }

  @ApiOperation({ summary: '[TEST] Tạo giao dịch hoàn tiền mẫu (test)' })
  @ApiResponse({ status: 201, description: 'Tạo giao dịch hoàn tiền test thành công.' })
  @Post('test-refund')
  @HttpCode(HttpStatus.CREATED)
  async testRefund() {
    // Dữ liệu mẫu, cần thay bằng transactionId thực tế để test thật
    const dto = {
      originalTransactionId: 'TXN123456',
      amount: 300000,
      reason: 'Test hoàn tiền',
    }
    const data = await this.transactionAnalyticsService.createRefund(dto as any)
    return { message: 'Tạo giao dịch hoàn tiền test thành công', data, status: 201 }
  }
}
