import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'johndoe', description: 'Username for the user', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'newpassword123', description: 'New password for the user', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
