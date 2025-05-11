import { ApiProperty, PartialType } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { Types } from 'mongoose'

export class CreateEmployeeDto {
  @ApiProperty({ example: 'duk@example.com', description: "Employee's email" })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({ example: 'duknguyen', description: 'Username of the employee' })
  @IsString()
  @IsNotEmpty()
  username!: string

  @ApiProperty({ example: 'P@ssword123', description: 'Password of the employee' })
  @IsString()
  @IsNotEmpty()
  password!: string

  @ApiProperty({ example: 'Duk Nguyen', description: 'Full name of the employee' })
  @IsString()
  @IsNotEmpty()
  fullName!: string

  @ApiProperty({ example: 'Manager', description: 'Position of the employee' })
  @IsString()
  @IsNotEmpty()
  position!: string

  @ApiProperty({ example: 'HR', description: 'Department of the employee' })
  @IsString()
  @IsNotEmpty()
  department?: string

  @ApiProperty({ example: ['605c72c3fc13ae1b3c000002'], description: 'List of specialty IDs' })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  specialty!: Types.ObjectId[]

  @ApiProperty({ example: '2023-05-15', description: 'Start date of the employee (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  startDate?: string

  @ApiProperty({ example: '094333346', description: "Employee's phone number" })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string

  @ApiProperty({ example: '2000-01-01', description: 'Birth date of the employee (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  birthDate?: string

  @ApiProperty({ example: 'avatar_url.jpg', description: "Employee's avatar", required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string

  @ApiProperty({ example: true, description: 'Is employee active?', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({ example: 5000, description: 'Salary of the employee', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number

  @ApiProperty({ example: 'Full-time', description: 'Type of contract', required: false })
  @IsOptional()
  @IsString()
  contractType?: string

  @ApiProperty({
    example: { name: 'Hanoi', code: 1, division_type: 'City', codename: 'hanoi', phone_code: 24 },
    description: 'City where employee is located',
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
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
