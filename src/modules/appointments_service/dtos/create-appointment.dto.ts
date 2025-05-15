import { ApiProperty } from "@nestjs/swagger"
import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class CreateAppointmentDto {
    @ApiProperty()
    @IsMongoId()
    case_id!: string

    @ApiProperty()
    @IsMongoId()
    specialty!: string

    @ApiProperty()
    @IsMongoId()
    doctor!: string

    @ApiProperty()
    @IsString()
    date!: string

    @ApiProperty()
    @IsString()
    slot!: string

    @ApiProperty({ default: 'Asia/Ho_Chi_Minh' })
    @IsString()
    @IsNotEmpty()
    timezone!: string
  }
