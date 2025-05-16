import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class SubmitRatingDto {
  @ApiProperty({ description: 'ID của lịch hẹn' })
  @IsString()
  appointmentId!: string

  @ApiProperty({ description: 'Điểm đánh giá từ 1-5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingScore!: number

  @ApiProperty({ description: 'Nhận xét về bác sĩ', required: false })
  @IsString()
  @IsOptional()
  description?: string
}
