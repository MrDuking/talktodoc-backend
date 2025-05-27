import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

export class MedicationItemDto {
  @ApiProperty({ description: 'Tên thuốc', example: 'Paracetamol' })
  @IsString()
  name?: string

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

  @ApiProperty({ description: 'Giá', example: 100000 })
  @IsNumber()
  price!: number

  @ApiProperty({ description: 'Số lượng', example: 10 })
  @IsNumber()
  quantity!: number
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
