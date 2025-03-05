import { Type } from "class-transformer"
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class UserDto {
    @IsString()
    @IsNotEmpty()
    id: string

    @IsBoolean()
    isTelegramPremiumUser: boolean

    @IsString()
    @IsOptional()
    email: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    walletAddress: string

    @IsNumber()
    exp: number

    @Type(() => Date)
    @IsOptional()
    @IsDate()
    lastLoginDate: Date

    @IsString()
    @IsNotEmpty()
    refCode: string

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    refCodeUpdateTime: Date

    @IsString()
    @IsOptional()
    refBy: string

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    refTime: Date

    @IsNumber()
    referralPoint: number

    @IsNumber()
    premiumReferralPoint: number

    @IsString()
    @IsNotEmpty()
    sessionId: string

    @IsString()
    @IsOptional()
    countryCode: string

    @IsString()
    @IsOptional()
    lastLoginIP: string

    @IsNumber()
    @IsOptional()
    playTime: number

    @IsString()
    @IsOptional()
    avatar: string
}
