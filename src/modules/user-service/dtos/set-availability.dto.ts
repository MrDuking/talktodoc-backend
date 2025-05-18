import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsString, Max, Min, ValidateNested } from 'class-validator'
class TimeSlotDto {
  @ApiProperty()
  @IsInt()
  index!: number

  @ApiProperty()
  @IsString()
  timeStart!: string

  @ApiProperty()
  @IsString()
  timeEnd!: string
}

class AvailabilityItemDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number

  @ApiProperty({ type: [TimeSlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlot!: TimeSlotDto[]
}

export class SetAvailabilityDto {
  @ApiProperty({ type: [AvailabilityItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityItemDto)
  availability!: AvailabilityItemDto[]
}
