import { IsNotEmpty, IsString } from "class-validator"

export class FindUserByRefCodeDto {
    @IsString()
    @IsNotEmpty()
    refCode: string
}
