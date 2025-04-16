import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'hoangminh01 / johndoe@gmail.com / 0667284738', description: 'Username, email or PhoneNumber' })
  @IsString()
  identifier!: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @IsString()
  @MinLength(6)
  password!: string;
}
