// payment-request.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class PaymentRequestDto {
  @ApiProperty({
    description: 'User ID making the payment',
    example: '6405f7d2e4b0b7a7c8d9e0f1',
  })
  @IsNotEmpty()
  @IsString()
  patient!: string

  @ApiProperty({
    description: 'Doctor ID related to this payment (optional)',
    example: '6405f7d2e4b0b7a7c8d9e0f2',
    required: false,
  })
  @IsOptional()
  @IsString()
  doctorId?: string

  @ApiProperty({
    description: 'Appointment ID related to this payment (optional)',
    example: '6405f7d2e4b0b7a7c8d9e0f3',
    required: false,
  })
  @IsOptional()
  @IsString()
  appointmentId?: string

  @ApiProperty({
    description: 'Payment amount in VND',
    example: 199000,
    minimum: 10000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(10000)
  amount!: number
}
