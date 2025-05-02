import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ example: 'user_123', description: 'ID of the user initiating the conversation' })
  @IsString()
  user_id!: string;
}