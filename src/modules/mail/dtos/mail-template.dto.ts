import { IsEmail, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MailTemplateDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email người nhận' })
  @IsEmail()
  to!: string;

  @ApiProperty({ example: 'Lịch hẹn xác nhận', description: 'Tiêu đề email' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({ example: 'appointment-confirm', description: 'Tên template (không cần .html)' })
  @IsString()
  @IsNotEmpty()
  template!: string;

  @ApiProperty({
    example: {
      name: 'Nguyễn Văn Thiện',
      doctor: 'BS. Lê Văn A',
      date: '2025-04-20',
      slot: '09:00-10:00',
    },
    description: 'Biến động truyền vào template (render bằng handlebars)',
  })
  @IsObject()
  variables!: Record<string, any>;
}
