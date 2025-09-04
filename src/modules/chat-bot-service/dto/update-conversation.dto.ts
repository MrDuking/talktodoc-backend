import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateConversationDto {
  @ApiPropertyOptional({
    example: 'AI - gpt-4o',
    description: 'Tiêu đề của conversation',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  title?: string

  @ApiPropertyOptional({
    example: 'ai',
    description: 'Loại conversation',
    enum: ['ai', 'doctor'],
  })
  @IsEnum(['ai', 'doctor'])
  @IsOptional()
  type?: 'ai' | 'doctor'

  @ApiPropertyOptional({
    example: 'gpt-4o',
    description: 'Model được sử dụng',
  })
  @IsString()
  @IsOptional()
  model_used?: string
}
