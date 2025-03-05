import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateUserReferralRequestDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly userId: string

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    readonly server: number

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly refBy: string

    @ApiProperty({ default: new Date() })
    @Transform(({ value }) => new Date(value))
    @IsDate()
    refTime: Date
}
