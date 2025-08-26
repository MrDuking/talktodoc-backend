import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString } from 'class-validator'

export class CreateConversationDto {
  @ApiProperty({ example: 'user_123', description: 'ID of the user initiating the conversation' })
  @IsString()
  user_id!: string

  @ApiPropertyOptional({
    example: 'gpt-3.5-turbo',
    description: 'Model to use for the conversation. If omitted, server default is used.',
  })
  @IsOptional()
  @IsString()
  model_used?: string

  @ApiPropertyOptional({
    example: { locale: 'vi-VN' },
    description: 'Optional context object attached to the conversation',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>
}
