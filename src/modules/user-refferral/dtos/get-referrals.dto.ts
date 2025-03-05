import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsDate, IsOptional, IsString } from "class-validator"
import { PageOptionsDto } from "src/common/dtos"

export class GetReferralsRequestDto extends PageOptionsDto {
    @ApiProperty()
    @IsString()
    userId: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    server: number

    @ApiPropertyOptional({ default: new Date() })
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    startDate?: Date

    @ApiPropertyOptional({ default: new Date() })
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    endDate?: Date
}
