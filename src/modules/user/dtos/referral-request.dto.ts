import { ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsDate, IsOptional } from "class-validator"
import { PageOptionsDto } from "src/common"

export class GetReferralQuery extends PageOptionsDto {
    @ApiPropertyOptional({ default: new Date() })
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    refStartDate?: Date

    @ApiPropertyOptional({ default: new Date() })
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    refEndDate?: Date
}
