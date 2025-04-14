import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentStatusDto {
  @ApiProperty({
    enum: ['PAID', 'UNPAID'],
    example: 'PAID',
    description: 'Final billing status after processing payment',
  })
  @IsEnum(['PAID', 'UNPAID'])
  billing_status!: 'PAID' | 'UNPAID';

  @ApiPropertyOptional({
    example: 'ORD123456',
    description: 'Optional payment gateway order ID for transaction reference',
  })
  @IsOptional()
  @IsString()
  orderId?: string;
}
