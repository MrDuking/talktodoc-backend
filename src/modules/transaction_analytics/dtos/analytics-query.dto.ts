import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator'

export enum PeriodType {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Khoảng thời gian (YYYY-MM-DD, YYYY-MM, YYYY)',
    example: '2024-05',
  })
  @IsString()
  @IsOptional()
  period?: string

  @ApiPropertyOptional({ description: 'Kiểu khoảng thời gian', enum: PeriodType })
  @IsEnum(PeriodType)
  @IsOptional()
  periodType?: PeriodType

  @ApiPropertyOptional({ description: 'Lọc theo bác sĩ', example: '64f7d17d3b2f5c0012e3e7b8' })
  @IsMongoId()
  @IsOptional()
  doctorId?: string

  @ApiPropertyOptional({ description: 'Lọc theo bệnh nhân', example: '64f7d17d3b2f5c0012e3e7b9' })
  @IsMongoId()
  @IsOptional()
  patientId?: string
}
