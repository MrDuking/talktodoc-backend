import { User } from "@tma.js/init-data-node"

export class ParsedUser implements User {
    addedToAttachmentMenu?: boolean
    allowsWriteToPm?: boolean
    firstName: string
    id: number
    isBot?: boolean
    isPremium?: boolean
    lastName?: string
    languageCode?: string
    photoUrl?: string
    username?: string
    sessionId: string
}
