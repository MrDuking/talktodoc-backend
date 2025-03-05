import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class UpdateWalletAddressDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    walletAddress: string
}
