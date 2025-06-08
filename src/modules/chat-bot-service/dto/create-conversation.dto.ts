import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateConversationDto {
  @ApiProperty({ example: 'user_123', description: 'ID of the user initiating the conversation' })
  @IsString()
  user_id!: string

  @ApiProperty({ example: 'gpt-3.5-turbo', description: 'Model used for the conversation' })
  @IsString()
  model_used!: string

  @ApiProperty({ example: 'context', description: 'Context of the conversation' })
  @IsString()
  context!: string
}
