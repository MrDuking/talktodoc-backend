import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    example: '660fa13a9fc0',
    description: 'ID of the selected medical speciality',
  })
  @IsMongoId()
  specialty!: string;
}
