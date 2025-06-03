import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator'
import { TransactionType } from '../schemas/transaction.schema'

export class CreateTransactionDto {
  @ApiProperty({ description: 'Loại giao dịch', enum: TransactionType })
  @IsEnum(TransactionType)
  type!: TransactionType

  @ApiProperty({ description: 'Số tiền giao dịch (VND)', example: 200000 })
  @IsNumber()
  amount!: number

  @ApiPropertyOptional({ description: 'Mã tiền tệ', example: 'VND', default: 'VND' })
  @IsString()
  @IsOptional()
  currency?: string

  @ApiPropertyOptional({ description: 'ID bệnh nhân', example: '64f7d17d3b2f5c0012e3e7b9' })
  @IsMongoId()
  @IsOptional()
  patientId?: string

  @ApiPropertyOptional({ description: 'ID bác sĩ', example: '64f7d17d3b2f5c0012e3e7b8' })
  @IsMongoId()
  @IsOptional()
  doctorId?: string

  @ApiPropertyOptional({ description: 'ID lịch hẹn', example: '64f7d17d3b2f5c0012e3e7b7' })
  @IsMongoId()
  @IsOptional()
  appointmentId?: string

  @ApiPropertyOptional({ description: 'ID case', example: '64f7d17d3b2f5c0012e3e7b6' })
  @IsMongoId()
  @IsOptional()
  caseId?: string

  @ApiPropertyOptional({ description: 'Order ID', example: 'ORDER123456' })
  @IsString()
  @IsOptional()
  orderId?: string

  @ApiPropertyOptional({ description: 'Phương thức thanh toán', example: 'VNPAY' })
  @IsString()
  @IsOptional()
  paymentMethod?: string

  @ApiPropertyOptional({ description: 'ID giao dịch cổng thanh toán', example: 'VNPAY123456' })
  @IsString()
  @IsOptional()
  paymentGatewayId?: string

  @ApiPropertyOptional({ description: 'Phí nền tảng', example: 20000 })
  @IsNumber()
  @IsOptional()
  platformFee?: number

  @ApiPropertyOptional({ description: 'Phí bác sĩ', example: 180000 })
  @IsNumber()
  @IsOptional()
  doctorFee?: number

  @ApiPropertyOptional({ description: 'Hoa hồng', example: 20000 })
  @IsNumber()
  @IsOptional()
  commission?: number

  @ApiPropertyOptional({ description: 'ID giao dịch gốc (nếu là refund)', example: 'TXN123456' })
  @IsString()
  @IsOptional()
  originalTransactionId?: string

  @ApiPropertyOptional({ description: 'Danh sách ID giao dịch offset', type: [String] })
  @IsOptional()
  offsetTransactionIds?: string[]

  @ApiProperty({ description: 'Số tiền thực nhận (sau khi trừ phí)', example: 180000 })
  @IsNumber()
  netAmount!: number

  @ApiPropertyOptional({ description: 'Mô tả giao dịch', example: 'Thanh toán lịch hẹn' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ description: 'Metadata bổ sung', type: Object })
  @IsOptional()
  metadata?: Record<string, any>
}
