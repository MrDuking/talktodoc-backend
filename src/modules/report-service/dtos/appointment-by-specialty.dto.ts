import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator'

export class AppointmentBySpecialtyRequestDto {
  @ApiProperty({
    example: [2023, 2024],
    description: 'Danh sách các năm cần thống kê',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  years?: number[]

  @ApiProperty({
    example: [5, 6],
    description: 'Danh sách các tháng cần thống kê (1-12)',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  months?: number[]

  @ApiProperty({ example: '2024-05-01', required: false })
  @IsString()
  @IsOptional()
  startDate?: string

  @ApiProperty({ example: '2024-08-01', required: false })
  @IsString()
  @IsOptional()
  endDate?: string
}

export class SpecialtyMonthlyStatDto {
  @ApiProperty({ example: 'Nội tổng quát' })
  name!: string

  @ApiProperty({ example: [10, 20, 15, 12, 18, 22, 25, 30, 28, 24, 20, 18] })
  monthly!: number[]
}

export class AppointmentBySpecialtyYearDto {
  @ApiProperty({ example: 2023 })
  year!: number

  @ApiProperty({ type: [SpecialtyMonthlyStatDto] })
  @ValidateNested({ each: true })
  @Type(() => SpecialtyMonthlyStatDto)
  specialties!: SpecialtyMonthlyStatDto[]
}

export class AppointmentBySpecialtyRangeSeriesDto {
  @ApiProperty({ example: '2024' })
  year!: string

  @ApiProperty({
    type: [Object],
    example: [
      { name: 'Nội tổng quát', data: [18, 20, 22, 19] },
      { name: 'Nhi khoa', data: [10, 12, 13, 11] },
    ],
  })
  series!: { name: string; data: number[] }[]
}

export class AppointmentBySpecialtyRangeResponseDto {
  @ApiProperty({ example: ['Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8'] })
  categories!: string[]

  @ApiProperty({ type: [AppointmentBySpecialtyRangeSeriesDto] })
  @ValidateNested({ each: true })
  @Type(() => AppointmentBySpecialtyRangeSeriesDto)
  series!: AppointmentBySpecialtyRangeSeriesDto[]
}
