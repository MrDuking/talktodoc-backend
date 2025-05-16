import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class PaymentCallbackDto {
  @ApiProperty({
    description: 'Order ID reference',
    example: '2503231234567',
  })
  vnp_TxnRef!: string

  @ApiProperty({
    description: 'Payment result code from VNPay (00 = success)',
    example: '00',
  })
  vnp_ResponseCode!: string

  @ApiProperty({
    description: 'Signature hash for verification',
    example: 'a1b2c3d4e5f6g7h8i9j0...',
  })
  vnp_SecureHash!: string

  @ApiPropertyOptional({
    description: 'Payment amount (in VND, multiplied by 100)',
    example: 19900000, // 199,000 VND
  })
  vnp_Amount?: number

  @ApiPropertyOptional({
    description: 'Order information',
    example: 'Thanh toan Premium: 2503231234567',
  })
  vnp_OrderInfo?: string
}
