import { IsMongoId, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {

  @ApiProperty()
  @IsMongoId()
  specialty!: string;

  @ApiProperty({ default: "Asia/Ho_Chi_Minh" })
  @IsString()
  @IsNotEmpty()
  timezone!: string;

}
