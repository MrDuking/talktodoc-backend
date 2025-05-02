import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'Tôi bị đau bụng nhiều ngày', description: 'Message content from user' })
  @IsString()
  message!: string;

  @ApiProperty({ example: 'user_123', description: 'ID of the user sending the message' })
  @IsString()
  user_id!: string;
}
