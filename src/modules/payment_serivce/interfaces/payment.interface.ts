// interfaces/payment.interface.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaymentUrlResponse {
  @ApiProperty({
    description: 'Generated payment URL for VNPay',
    example:
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=19900000&vnp_Command=pay&...',
  })
  paymentUrl!: string;
}

export class PaymentVerificationResponse {
  @ApiProperty({
    description: 'Whether the payment was successful',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Message describing the result',
    example: 'Payment successful, package upgraded to premium',
  })
  message!: string;

  @ApiProperty({
    description: 'Order ID reference',
    example: '2503231234567',
  })
  orderId?: string;

  @ApiProperty({
    description: 'User ID associated with the payment',
    example: '6405f7d2e4b0b7a7c8d9e0f1',
  })
  userId?: string;
}

// This interface is for internal use, doesn't need API decorations
export interface VnpayParams {
  [key: string]: string | number;
}
