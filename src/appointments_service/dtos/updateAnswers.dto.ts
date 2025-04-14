import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAnswersDto {
  @ApiProperty({
    example: { symptom: 'Persistent cough', duration: '3 days' },
    description: 'Responses to the medical intake form for the selected speciality',
  })
  @IsObject()
  answers_data!: Record<string, any>;
}
