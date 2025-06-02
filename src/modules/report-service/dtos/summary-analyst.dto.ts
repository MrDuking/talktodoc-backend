import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'

export enum TypeSummaryEnum {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  APPOINTMENT = 'appointment',
  REVENUE = 'revenue',
}

export class DateRangeDto {
  @ApiProperty({
    example: '2024-01-01',
    description: 'Ngày bắt đầu thống kê (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string

  @ApiProperty({
    example: '2024-01-31',
    description: 'Ngày kết thúc thống kê (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string
}

export class SummaryAnalystRequestDto {
  @ApiProperty({
    example: 'patient',
    description: 'Loại thống kê (patient | doctor | appointment | revenue)',
    enum: TypeSummaryEnum,
  })
  @IsEnum(TypeSummaryEnum)
  @IsNotEmpty()
  typeSummary!: TypeSummaryEnum

  @ApiProperty({
    description:
      'Khoảng thời gian tùy chỉnh (optional). Nếu không truyền sẽ mặc định thống kê tháng hiện tại',
    type: DateRangeDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto
}

export class SummaryAnalystResponseDto {
  @ApiProperty({
    example: 0.2,
    description: 'Tỷ lệ thay đổi so với kỳ trước (0.2 = tăng 20%, -0.1 = giảm 10%)',
  })
  percent!: number

  @ApiProperty({
    example: 4876,
    description: 'Tổng số lượng trong kỳ hiện tại',
  })
  total!: number

  @ApiProperty({
    example: [20, 41, 63, 33],
    description: 'Mảng 4 phần tử thể hiện số lượng theo 4 khoảng thời gian con',
    isArray: true,
    type: Number,
  })
  series!: number[]
}
