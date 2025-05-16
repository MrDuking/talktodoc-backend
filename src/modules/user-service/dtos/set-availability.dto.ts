import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsString, Max, Min, ValidateNested } from 'class-validator'

class AvailabilityItemDto {
  @ApiProperty({ example: 1, description: 'Thứ trong tuần (0=CN, 1=T2, ..., 6=T7)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number

  @ApiProperty({ example: 1, description: 'Thứ tự ca trong ngày' })
  @IsInt()
  index!: number

  @ApiProperty({ example: '08:00', description: 'Giờ bắt đầu' })
  @IsString()
  timeStart!: string

  @ApiProperty({ example: '12:00', description: 'Giờ kết thúc' })
  @IsString()
  timeEnd!: string
}

export class SetAvailabilityDto {
  @ApiProperty({ type: [AvailabilityItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityItemDto)
  availability!: AvailabilityItemDto[]
}
