import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator'

export class RegisterUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username!: string

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty()
  @IsString()
  @Matches(/^[0-9]{10,11}$/)
  phoneNumber!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string
}
