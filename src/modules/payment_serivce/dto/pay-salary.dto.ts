import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsDateString, IsString } from 'class-validator'

export class PaySalaryDto {
  @ApiProperty({ type: [String], description: 'Danh sách _id của bác sĩ' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  doctorIds!: string[]

  @ApiProperty({ type: [String], description: 'Danh sách _id của order' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  orderIds!: string[]

  @ApiProperty({ description: 'Ngày bắt đầu lọc hóa đơn (YYYY-MM-DD)' })
  @IsDateString()
  startDate!: string

  @ApiProperty({ description: 'Ngày kết thúc lọc hóa đơn (YYYY-MM-DD)' })
  @IsDateString()
  endDate!: string
}
