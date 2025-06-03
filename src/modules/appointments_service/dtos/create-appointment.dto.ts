import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateAppointmentDto {
  @ApiProperty()
  @IsMongoId()
  case_id!: string

  @ApiProperty()
  @IsMongoId()
  specialty!: string

  @ApiProperty()
  @IsMongoId()
  doctor!: string

  @ApiProperty()
  @IsString()
  date!: string

  @ApiProperty()
  @IsString()
  slot!: string

  @ApiProperty({ default: 'Asia/Ho_Chi_Minh' })
  @IsString()
  @IsNotEmpty()
  timezone!: string

  @ApiProperty({ required: false, description: 'Phương thức thanh toán: WALLET hoặc VNPAY' })
  @IsString()
  @IsOptional()
  paymentMethod?: string
}
