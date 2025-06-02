import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsInt, Min } from 'class-validator'

export class TopDoctorsRequestDto {
  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate!: string

  @ApiProperty({ example: '2024-12-31' })
  @IsDateString()
  endDate!: string

  @ApiProperty({ example: 5, default: 5 })
  @IsInt()
  @Min(1)
  limit!: number
}

export class TopDoctorItemDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ nullable: true })
  avatar!: string | null

  @ApiProperty()
  specialty!: string

  @ApiProperty()
  experience!: number

  @ApiProperty()
  rating!: number

  @ApiProperty()
  totalPatients!: number

  @ApiProperty()
  totalReviews!: number

  @ApiProperty()
  totalAppointments!: number

  @ApiProperty()
  revenue!: number

  @ApiProperty({ enum: ['active', 'busy', 'offline'] })
  status!: 'active' | 'busy' | 'offline'
}
