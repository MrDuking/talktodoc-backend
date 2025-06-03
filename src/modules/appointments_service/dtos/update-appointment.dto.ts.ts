import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsMongoId, IsObject, IsOptional, IsString } from 'class-validator'

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
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

  @ApiProperty({ required: false, description: 'Lý do hủy lịch hẹn' })
  @IsOptional()
  @IsString()
  reason?: string

  @ApiProperty({ required: false, enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus

  @IsOptional()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  duration_call?: string

  @IsOptional()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @ApiProperty({ required: false, description: 'Giảm điểm bác sĩ' })
  @IsOptional()
  @IsBoolean()
  decreasePoint?: boolean
}
