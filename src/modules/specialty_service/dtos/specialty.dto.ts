import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateSpecialtyDto {
  @ApiProperty({ example: 'Cardiology', description: 'Name of the specialty' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({
    example: 'Related to heart and blood vessels',
    description: 'Description of the specialty',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ example: true, description: 'Is specialty active?', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({
    example: { requiresAppointment: true, hasEmergencySupport: false },
    description: 'Configuration settings for the specialty',
    required: false,
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>
}

export class UpdateSpecialtyDto extends PartialType(CreateSpecialtyDto) {}
