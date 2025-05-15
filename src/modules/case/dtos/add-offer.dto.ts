import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class MedicationItemDto {
  @ApiProperty({ description: 'ID thuốc từ collection Medicine' })
  @IsMongoId({ message: 'medicationId không hợp lệ' })
  medicationId!: string

  @ApiProperty({ description: 'Liều lượng', example: '500mg' })
  @IsString()
  dosage!: string

  @ApiProperty({ description: 'Cách dùng', example: '1 viên mỗi 8 tiếng' })
  @IsString()
  usage!: string

  @ApiProperty({ description: 'Thời gian dùng', example: '3 ngày' })
  @IsString()
  duration!: string
}

export class AddOfferDto {
  @ApiProperty({ description: 'Ghi chú thêm của bác sĩ (nếu có)' })
  @IsOptional()
  @IsString()
  note?: string

  @ApiProperty({
    description: 'Danh sách thuốc kê đơn',
    type: [MedicationItemDto],
  })
  @IsArray({ message: 'medications phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => MedicationItemDto)
  medications!: MedicationItemDto[]
}
