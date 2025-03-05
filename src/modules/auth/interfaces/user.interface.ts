export interface User {
    id: string
    isTelegramPremiumUser: boolean
    email: string
    name: string
    walletAddress: string
    exp: number
    lastLoginDate: string
    refCode: string
    refCodeUpdateTime: string
    refBy: string
    refTime: string
    referralPoint: number
    premiumReferralPoint: number
    sessionId: string
    countryCode: string
    lastLoginIP: string
    avatar: string
    playTime: number
    isRegisteredPayment: boolean
}
