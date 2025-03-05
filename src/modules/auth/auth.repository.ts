// import { nanoid } from "nanoid"
import { Injectable } from "@nestjs/common"
import { isDifferentDate } from "src/utils/utils"
import { User } from "../../common/schemas/user.schema"
import { UserRepository } from "../user/repositories"
import { UserService } from "../user/user.service"

@Injectable()
export class AuthRepository {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly userService: UserService
    ) {}

    async signup(userData: User): Promise<User> {
        const userProfile = await this.userService.initializeUser(userData)
        return userProfile
    }

    async login(userData: User): Promise<User> {
        let findUser: User | null = await this.userService.findUser(userData.id)
        if (!findUser) {
            findUser = await this.signup(userData)
        } else {
            const cmdUpdate = {
                // $inc: { playTime: 1 },
                lastLoginDate: new Date().toString(),
                name: userData.name,
                isTelegramPremiumUser: userData.isTelegramPremiumUser,
                sessionId: userData.sessionId
            }

            if (findUser.lastLoginDate == null || isDifferentDate(new Date(findUser.lastLoginDate), new Date())) {
                console.log("Login new date!")
            }

            findUser = await this.userRepository.findOneAndUpdate(userData.id, cmdUpdate, { new: true })
        }
        return findUser
    }
}
