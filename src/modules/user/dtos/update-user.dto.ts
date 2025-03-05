import { IsBoolean, IsDate, IsNotEmpty, IsObject, IsString } from "class-validator"

export class CmdUpdate {
    @IsObject()
    @IsNotEmpty()
    $inc: {
        playTime: number
    }

    @IsDate()
    @IsNotEmpty()
    lastLoginDate: Date

    @IsString()
    @IsNotEmpty()
    name: string

    @IsBoolean()
    @IsNotEmpty()
    isTelegramPremiumUser: boolean

    @IsString()
    @IsNotEmpty()
    sessionId: string | undefined
}

export class UpdateUserPreniumDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsBoolean()
    @IsNotEmpty()
    isTelegramPremiumUser: boolean
}

export class UpdateUserAvatarDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    avatar: string
}

export class UpdateUserRefByDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    refBy: string
}

export class UpdateUserTotalQuestPoint {
    @IsString()
    @IsNotEmpty()
    userId: string
}
