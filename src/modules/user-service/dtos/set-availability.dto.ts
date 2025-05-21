import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator'

export class TimeSlotDto {
  @ApiProperty({ description: 'Thứ tự ca trong ngày', example: 0 })
  @IsNumber()
  index!: number

  @ApiProperty({ description: 'Thời gian bắt đầu', example: '08:00' })
  @IsString()
  timeStart!: string

  @ApiProperty({ description: 'Thời gian kết thúc', example: '12:00' })
  @IsString()
  timeEnd!: string
}

export class DayAvailabilityDto {
  @ApiProperty({ description: 'Thứ trong tuần (0 = CN, 1 = T2, ..., 6 = T7)', example: 1 })
  @IsNumber()
  dayOfWeek?: number

  @ApiProperty({ type: [TimeSlotDto], description: 'Danh sách các ca làm việc trong ngày' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlot!: TimeSlotDto[]
}

export class SetAvailabilityDto {
  @ApiProperty({ type: [DayAvailabilityDto], description: 'Lịch làm việc trong tuần' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayAvailabilityDto)
  availability!: DayAvailabilityDto[]
}
