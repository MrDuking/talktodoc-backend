import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateHospitalDto {
  @ApiProperty({ example: 'General Hospital', description: 'Hospital name' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: '123 Main Street, City', description: 'Hospital address' })
  @IsString()
  @IsNotEmpty()
  address!: string

  @ApiProperty({ example: '+1234567890', description: 'Hospital phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string

  @ApiProperty({
    example: ['65f7d17d3b2f5c0012e3e7b9', '65f7d18d3b2f5c0012e3e7c0'],
    description: 'List of specialties (IDs of Speciality)',
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  specialty!: string[]

  @ApiProperty({ example: false, description: 'Is the hospital public?', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean

  @ApiProperty({ example: true, description: 'Is the hospital active?', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdateHospitalDto extends PartialType(CreateHospitalDto) {}
