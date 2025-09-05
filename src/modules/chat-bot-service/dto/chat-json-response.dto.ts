import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ChatJsonResponseDto {
  @ApiProperty({ example: true, description: 'Trạng thái thành công' })
  success!: boolean

  @ApiProperty({ example: 'Tôi hiểu bạn muốn khám bệnh...', description: 'Phản hồi text từ AI' })
  reply!: string

  @ApiPropertyOptional({
    example: {
      type: 'appointment_suggestion',
      data: {
        doctorId: 'doc_789',
        doctorName: 'BS. Nguyễn Văn A',
        suggestedDate: '2024-01-20',
        suggestedTime: '14:00',
      },
    },
    description: 'Dữ liệu JSON có cấu trúc từ AI (nếu có)',
  })
  jsonData?: {
    type: string
    data: Record<string, unknown>
  }

  @ApiProperty({ example: '2024-01-20T18:00:00Z', description: 'Thời gian phản hồi' })
  timestamp!: string

  @ApiProperty({ example: 'gpt-4o-mini', description: 'Model AI được sử dụng' })
  model!: string

  @ApiPropertyOptional({
    example: {
      inputTokens: 150,
      outputTokens: 200,
      totalTokens: 350,
    },
    description: 'Thông tin token usage',
  })
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

export class SendJsonMessageDto {
  @ApiProperty({ example: 'Tôi muốn khám bệnh', description: 'Tin nhắn từ user' })
  message!: string

  @ApiProperty({ example: 'user_123', description: 'ID của user' })
  user_id!: string

  @ApiPropertyOptional({
    example: ['https://example.com/image1.jpg'],
    description: 'Danh sách URL ảnh',
  })
  imageUrls?: string[]

  @ApiPropertyOptional({
    example: 'gpt-4o',
    description: 'Model AI để sử dụng',
  })
  model?: string

  @ApiPropertyOptional({
    example: true,
    description: 'Có yêu cầu trả về JSON structured data không',
  })
  requireJsonResponse?: boolean

  @ApiPropertyOptional({
    example: 'appointment_suggestion',
    description: 'Loại JSON response mong muốn',
  })
  jsonResponseType?: string
}
