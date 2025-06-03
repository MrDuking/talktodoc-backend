import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateRefundDto {
  @ApiProperty({ description: 'ID giao dịch gốc cần hoàn tiền', example: 'TXN123456' })
  @IsString()
  @IsNotEmpty()
  originalTransactionId!: string

  @ApiProperty({ description: 'Số tiền hoàn trả', example: 50000 })
  @IsNumber()
  @IsNotEmpty()
  amount!: number

  @ApiPropertyOptional({ description: 'Lý do hoàn tiền', example: 'Bệnh nhân hủy lịch' })
  @IsString()
  @IsOptional()
  reason?: string

  @ApiPropertyOptional({ description: 'Metadata bổ sung', type: Object })
  @IsOptional()
  metadata?: Record<string, any>
}
