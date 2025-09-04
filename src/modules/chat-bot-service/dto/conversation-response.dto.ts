import { ApiProperty } from '@nestjs/swagger'

export class ConversationResponseDto {
  @ApiProperty({ example: 'conv_001', description: 'ID của conversation' })
  id!: string

  @ApiProperty({ example: 'AI - gpt-4o-mini', description: 'Tiêu đề conversation' })
  title!: string

  @ApiProperty({ example: 'Bạn nhớ uống nhiều nước nhé...', description: 'Tin nhắn cuối cùng' })
  lastMessage!: string

  @ApiProperty({ example: '2024-01-20T18:00:00Z', description: 'Thời gian cập nhật cuối' })
  updatedAt!: string

  @ApiProperty({ example: true, description: 'Có tin nhắn chưa đọc không' })
  unread!: boolean

  @ApiProperty({ example: 'gpt-4o-mini', description: 'Model được sử dụng' })
  model_used!: string

  @ApiProperty({ example: 'ai', description: 'Loại conversation', enum: ['ai', 'doctor'] })
  type!: 'ai' | 'doctor'

  @ApiProperty({ example: 'https://example.com/ai-avatar.png', description: 'Avatar URL' })
  avatar!: string

  @ApiProperty({ example: 1, description: 'Số lượng người tham gia' })
  participantCount!: number
}

export class PaginationDto {
  @ApiProperty({ example: 1, description: 'Trang hiện tại' })
  page!: number

  @ApiProperty({ example: 20, description: 'Số items per page' })
  limit!: number

  @ApiProperty({ example: 45, description: 'Tổng số items' })
  total!: number

  @ApiProperty({ example: 3, description: 'Tổng số trang' })
  totalPages!: number
}

export class GetConversationsResponseDto {
  @ApiProperty({ example: true, description: 'Trạng thái thành công' })
  success!: boolean

  @ApiProperty({ type: [ConversationResponseDto], description: 'Danh sách conversations' })
  data!: ConversationResponseDto[]

  @ApiProperty({ type: PaginationDto, description: 'Thông tin phân trang' })
  pagination!: PaginationDto
}
