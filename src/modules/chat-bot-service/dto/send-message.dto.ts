// send-message.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator'

export class SendMessageDto {
  @ApiProperty({
    example: 'Tôi bị đau bụng nhiều ngày',
    description: 'Nội dung tin nhắn từ người dùng (có thể để trống nếu chỉ gửi ảnh)',
  })
  @IsOptional()
  @IsString()
  message!: string

  @ApiProperty({ example: 'user_123', description: 'ID của người gửi tin nhắn' })
  @IsString()
  user_id!: string

  @ApiPropertyOptional({
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    description: 'Danh sách URL hình ảnh gửi kèm (nếu có)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[]
}
