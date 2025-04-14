import { IsMongoId, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDoctorAndTimeDto {
  @ApiProperty({
    example: '66123abc',
    description: 'ID of the doctor assigned to the appointment',
  })
  @IsMongoId()
  doctor!: string;

  @ApiProperty({
    example: '2025-04-20T08:00:00Z',
    description: 'Appointment start time in UTC format (ISO 8601)',
  })
  @IsISO8601()
  start_time!: string;

  @ApiProperty({
    example: '2025-04-20T08:30:00Z',
    description: 'Appointment end time in UTC format (ISO 8601)',
  })
  @IsISO8601()
  end_time!: string;
}
