export interface UpdateUserPreniumMessage {
    userId: string
    isTelegramPremiumUser: boolean
}

export interface UpdateUserAvatarMessage {
    userId: string
    avatar: string
}

export interface UpdateUserRefByMessage {
    userId: string
    refBy: string
}

export interface FindUserRefCodeMessage {
    refCode: string
}
