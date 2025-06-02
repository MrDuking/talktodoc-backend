import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'

export class AppointmentStatusSummaryRequestDto {
  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate!: string

  @ApiProperty({ example: '2024-12-31' })
  @IsDateString()
  endDate!: string
}

export class AppointmentStatusSummaryItemDto {
  @ApiProperty({ example: 'CONFIRMED' })
  status!: string

  @ApiProperty({ example: 'Đã Xác Nhận' })
  statusVn!: string

  @ApiProperty({ example: 1250 })
  count!: number
}
