import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFormConfigDto {
  @ApiProperty({
    description: 'JSON string containing the full form configuration',
    example: '[{"specialty_id": "SP123", "fields": [...]}]',
    type: String,
  })
  @IsString()
  form_json!: string;
}