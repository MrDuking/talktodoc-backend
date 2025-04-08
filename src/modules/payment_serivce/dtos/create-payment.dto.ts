import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'ORDER123', description: 'Mã đơn hàng (duy nhất)' })
  @IsNotEmpty()
  @IsString()
  orderId!: string;

  @ApiProperty({ example: 100000, description: 'Số tiền cần thanh toán (VND)' })
  @IsNotEmpty()
  @IsNumber()
  amount!: number;
}
