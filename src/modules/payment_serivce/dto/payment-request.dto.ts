import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class PaymentRequestDto {
  @ApiProperty({
    description: 'User ID making the payment',
    example: '67e3f1d36b4dbf9229f687c9',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'Payment amount in VND',
    example: 199000,
    minimum: 10000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(10000)
  amount!: number;
}