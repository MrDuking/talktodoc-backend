import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"
import { PageOptionsDto } from "src/common/dtos"

export class GetUserIDsRequestDto extends PageOptionsDto {
    @ApiProperty()
    @IsString()
    server: number
}
