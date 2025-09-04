import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class GetConversationsDto {
  @ApiPropertyOptional({
    example: 'user_123',
    description: 'ID của user để lấy danh sách conversations',
  })
  @IsString()
  @IsOptional()
  user_id?: string

  @ApiPropertyOptional({
    example: 1,
    description: 'Số trang (default: 1)',
    minimum: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    example: 20,
    description: 'Số items per page (default: 20, max: 100)',
    minimum: 1,
    maximum: 100,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 20

  @ApiPropertyOptional({
    example: 'ai',
    description: 'Filter by type',
    enum: ['ai', 'doctor'],
  })
  @IsEnum(['ai', 'doctor'])
  @IsOptional()
  type?: 'ai' | 'doctor'

  @ApiPropertyOptional({
    example: 'keyword',
    description: 'Search trong title và last_message',
  })
  @IsString()
  @IsOptional()
  search?: string
}
