import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger"
import { User } from "src/common/schemas/user.schema"

export class LoginRequestDto {
    @ApiProperty()
    is_premium: boolean

    @ApiProperty()
    refBy: string
}

export class LoginResponseDto {
    @ApiResponseProperty({ type: User })
    data: User

    @ApiResponseProperty()
    message: string
}
