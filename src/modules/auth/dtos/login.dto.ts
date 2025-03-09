import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'johndoe', description: 'Username of the user' })
  @IsString()
  username!: string;

  @ApiProperty({ example: 'password123', description: 'Password of the user' })
  @IsString()
  @MinLength(6)
  password!: string;
}
