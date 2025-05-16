import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateConversationDto {
  @ApiProperty({ example: 'user_123', description: 'ID of the user initiating the conversation' })
  @IsString()
  user_id!: string
}
