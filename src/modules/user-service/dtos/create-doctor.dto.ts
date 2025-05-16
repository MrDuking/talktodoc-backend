import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Types } from 'mongoose'
import { DoctorRegistrationStatus } from '../schemas/doctor.schema'

class AvailabilityDto {
  @ApiProperty({ example: '2025-03-20', description: 'Ngày làm việc (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  date!: string

  @ApiProperty({ example: ['08:00-09:00', '10:00-11:00'], description: 'Các khung giờ rảnh' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  timeSlots!: string[]
}

export class CreateDoctorDto {
  @ApiProperty({ example: 'duk', description: 'Tên tài khoản' })
  @IsString()
  @IsNotEmpty()
  username!: string

  @ApiProperty({ example: 'password123', description: 'Mật khẩu' })
  @IsString()
  @IsNotEmpty()
  password!: string

  @ApiProperty({ example: 'duk@example.com', description: 'Email' })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({ example: 'Dr. Duk Nguyen', description: 'Họ tên' })
  @IsString()
  @IsNotEmpty()
  fullName!: string

  @ApiProperty({ example: '1995-07-20', description: 'Ngày sinh (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  birthDate!: string

  @ApiProperty({ example: '0987123456', description: 'Số điện thoại' })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string

  @ApiProperty({ example: 'avatar.jpg', description: 'URL avatar', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string

  @ApiProperty({ example: true, description: 'Trạng thái hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({
    example: {
      name: 'Hà Nội',
      code: 1,
      division_type: 'City',
      codename: 'ha_noi',
      phone_code: 24,
    },
    description: 'Thông tin thành phố',
    required: false,
  })
  @IsOptional()
  city?: {
    name: string
    code: number
    division_type: string
    codename: string
    phone_code: number
  }

  @ApiProperty({ example: ['605c72c3fc13ae1b3c000002'], description: 'ID chuyên khoa' })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  specialty!: Types.ObjectId[]

  @ApiProperty({ example: '605c72c3fc13ae1b3c000002', description: 'ID bệnh viện' })
  @IsString()
  @IsNotEmpty()
  hospital!: string

  @ApiProperty({ example: 10, description: 'Số năm kinh nghiệm' })
  @IsNumber()
  @IsOptional()
  experienceYears?: number

  @ApiProperty({ example: 'MD123456', description: 'Số giấy phép hành nghề' })
  @IsString()
  @IsNotEmpty()
  licenseNo!: string

  @ApiProperty({ type: [AvailabilityDto], description: 'Lịch rảnh của bác sĩ' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDto)
  @IsOptional()
  availability?: AvailabilityDto[]

  @ApiProperty({ example: '605c72c3fc13ae1b3c000002', description: 'ID cấp bậc' })
  @IsString()
  @IsOptional()
  rank?: string

  @ApiProperty({ example: 'Trưởng khoa', description: 'Chức vụ', required: false })
  @IsString()
  @IsOptional()
  position?: string

  @ApiProperty({
    example: DoctorRegistrationStatus.PENDING,
    enum: DoctorRegistrationStatus,
    description: 'Trạng thái duyệt hồ sơ',
    required: false,
  })
  @IsOptional()
  @IsEnum(DoctorRegistrationStatus)
  registrationStatus?: DoctorRegistrationStatus
}

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
    @ApiProperty({
        example: true,
        description: 'Cờ để admin duyệt hồ sơ bác sĩ',
        required: false,
      })
      @IsOptional()
      @IsBoolean()
      approve_request?: boolean
}
