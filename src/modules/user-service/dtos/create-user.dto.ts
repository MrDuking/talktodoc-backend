import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'Username for the user' })
  @IsString()
  username?: string;

  @ApiProperty({ example: 'password123', description: 'Password for the user' })
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'johndoe@example.com', description: 'Email of the user' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;
}
