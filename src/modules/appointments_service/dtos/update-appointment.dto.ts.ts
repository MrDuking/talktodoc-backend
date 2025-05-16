import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsObject, IsOptional, IsString } from 'class-validator'

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export class UpdateAppointmentDto {
  @ApiProperty({ required: false, description: 'Form triệu chứng, đau như thế nào, mức độ...' })
  @IsOptional()
  @IsObject()
  medicalForm?: {
    symptoms?: string
    pain_level?: string
    [key: string]: any
  }
  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  doctor?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slot?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  payment?: {
    platformFee?: number
    doctorFee?: number
    discount?: number
    total?: number
    status?: PaymentStatus
    paymentMethod?: string
  }

  // @ApiProperty({ required: false })
  // @IsOptional()
  // @IsString()
  // status?: "PENDING" | "CONFIRMED" | "CANCELLED"

  // @ApiProperty({ required: false })
  // @IsOptional()
  // @IsMongoId()
  // specialty?: string

  @IsOptional()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string
}
