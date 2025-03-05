import { ApiProperty, ApiPropertyOptional, ApiResponseProperty } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class GetRefByRequestDto {
    @ApiProperty()
    @IsString()
    userId: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    server: number
}

export class GetRefByMessage {
    @ApiProperty()
    @IsString()
    userId: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    server: number
}

export class GetRefByResponseDto {
    @ApiResponseProperty()
    refCode: string | null

    // @ApiResponseProperty()
    // clubRefCode: string | null
}
