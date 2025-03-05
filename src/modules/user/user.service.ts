import { status } from "@grpc/grpc-js"
import { forwardRef, HttpStatus, Inject, Injectable } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import { HandlerError } from "@utils"
import { plainToClass } from "class-transformer"
import { Currency, MESSAGE_CODES, PageMetaDto, ResponseType } from "src/common"
import { isDifferentDate } from "src/utils/utils"
import { User } from "../../common/schemas/user.schema"
import { LeaderboardQuestService } from "../leaderboard/leaderboard-quest.service"
import { LeaderboardReferralService } from "../leaderboard/leaderboard-referral.service"
import { UserGameInfoService } from "../user-game-info/user-game-info.service"
import { UserInventoryService } from "../user-inventory/user-inventory.service"
import { GetReferralQuery } from "./dtos"
import { GetReferralPagingResponse, GetReferralResponse } from "./dtos/referral-response.dto"
import { UserRepository } from "./repositories"

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        @Inject(forwardRef(() => UserGameInfoService))
        private readonly userGameInfoService: UserGameInfoService,
        private readonly userInventoryService: UserInventoryService,
        private readonly leaderBoardReferralService: LeaderboardReferralService,
        private readonly leaderBoardQuestService: LeaderboardQuestService
    ) {}

    async findUser(id: string): Promise<User | null> {
        const user = await this.userRepository.findOneById(id)
        return user
    }

    async findUserWithInventory(id: string) {
        const user = await this.userRepository.findOneById(id)

        if (!user) return null

        const inventories = await this.userInventoryService.findUserInventoryAndItemByUserId(id)
        const gameInfo = await this.userGameInfoService.getUserGameInfo(id)

        return {
            ...user,
            inventories: inventories.userInventories,
            items: inventories.userItems,
            gameInfo
        }
    }

    async findAll(query: any, page: number, take: number): Promise<{ users: any; total: number; page: number; pages: number }> {
        const skip = (page - 1) * take

        try {
            const [users, total] = await Promise.all([this.userRepository.findAllPaginated(query, skip, take), this.userRepository.countUsers(query)])
            const pages = Math.ceil(total / take)
            const usersWithInventory = await Promise.all(
                users.map(async (user) => {
                    const inventories = await this.userInventoryService.findUserInventoryByUserId(user.id)
                    return {
                        ...user,
                        inventories
                    }
                })
            )
            // console.log({ users: usersWithInventory, total, page, pages })
            return { users: usersWithInventory, total, page, pages }
        } catch (error) {
            throw new RpcException(`Failed to get users: ${error.message}`)
        }
    }

    async initializeUser(userData: User): Promise<User> {
        const user: User = {
            id: userData.id,
            email: "",
            name: userData.name,
            lastLoginDate: new Date().toString(),
            refCode: userData.refCode ? userData.refCode : "test",
            refCodeUpdateTime: new Date().toString(),
            refBy: userData.refBy,
            refTime: new Date().toString(),
            sessionId: userData.sessionId || "",
            countryCode: "",
            lastLoginIP: "",
            createdAt: new Date(),
            avatar: userData.avatar !== "" ? userData.avatar : "",
            exp: 0,
            isTelegramPremiumUser: userData.isTelegramPremiumUser || false,
            playTime: 0
        }

        const [profile] = await Promise.all([
            this.userRepository.createNewUser(user),
            this.userGameInfoService.initializeUserGameInfo(userData.id),
            this.userInventoryService.findUserInventoryAndItemByUserId(userData.id)
        ])

        return profile
    }

    async updateUserLogin(user: User, userData: User): Promise<User> {
        const cmdUpdate = {
            lastLoginDate: new Date().toString(),
            name: userData.name,
            isTelegramPremiumUser: userData.isTelegramPremiumUser,
            sessionId: userData.sessionId
        }

        if (user.lastLoginDate == null || isDifferentDate(new Date(user.lastLoginDate), new Date())) {
            console.log("Login new date!")
        }

        return this.userRepository.findOneAndUpdate(user.id, cmdUpdate, { new: true }) as Promise<User>
    }

    async findAllUserId(): Promise<{ listUserIds: string[] }> {
        try {
            const users = await this.userRepository.findAll()

            const ids = users.map((u) => u.id)

            return {
                listUserIds: ids
            }
        } catch (error) {
            throw error
        }
    }

    async updateUserPrenium(userId: string, isPrenium: boolean): Promise<ResponseType<User | null>> {
        try {
            const res = await this.userRepository.updateUserPrenium(userId, isPrenium)
            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res
            }
        } catch (error) {
            throw error
        }
    }

    async updateUserAvatar(userId: string, avatar: string): Promise<ResponseType<User | null>> {
        try {
            const res = await this.userRepository.updateUserAvatar(userId, avatar)
            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res
            }
        } catch (error) {
            throw error
        }
    }

    async findUserByRefCode(refCode: string): Promise<ResponseType<User | null>> {
        try {
            const user = await this.userRepository.findUserByRefCode(refCode)
            // ISSUE: (@hhman24) check user ban

            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: user ? user : null
            }
        } catch (error) {
            throw error
        }
    }

    async updateUserRefBy(userId: string, refBy: string): Promise<ResponseType<User | null>> {
        try {
            const refByUser = await this.findUser(refBy)

            if (!refByUser || refByUser.id === userId) throw new HandlerError(`refBy not found ${refBy} or userId: ${userId} is refBy: ${refByUser?.id}`)

            const res = await this.userRepository.updateUserRefBy(userId, refBy)
            console.log("🚀 ~ UserService ~ updateUserRefBy ~ res:", res)

            // TODO: (@hhman24) call user game infor to add point referral of refBy
            if (res) {
                // TODO: (@hhman) caching ref user

                const refByUserGameInfo = (await this.userGameInfoService.updateTotalReferralPointGrpc(refBy)).data
                console.log("🚀 ~ UserService ~ updateUserRefBy ~ refByUserGameInfo:", refByUserGameInfo)

                if (refByUserGameInfo) {
                    if (res.isTelegramPremiumUser) {
                        // TODO: (@hhman24) do archievement
                    } else {
                        await this.userInventoryService.addMoney(refByUserGameInfo?.userId, Currency.LUDOTON, 5)
                    }

                    // TODO: summit user info to leaderboard
                    await this.leaderBoardReferralService.submitUserToReferralLeaderboard(refByUserGameInfo.userId, refByUserGameInfo.totalFriendInvited, {
                        name: refByUser?.name,
                        avatar: refByUser?.avatar,
                        refBy: refByUser?.refBy,
                        totalFriendInvited: refByUserGameInfo.totalFriendInvited,
                        totalLutonEarnedByInvite: refByUserGameInfo.totalLutonEarnedByInvite
                    })
                }
            }

            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res ? res : null
            }
        } catch (error) {
            throw error
        }
    }

    async increaseQuestPointGrpc(userId: string) {
        try {
            const user = await this.findUser(userId)
            const res = (await this.userGameInfoService.increaseQuestPointGrpc(userId)).data
            if (!user || !res) throw new HandlerError("user not found")

            await this.leaderBoardQuestService.submitUserAllLeaderboard(user?.id, res?.totalQuestPointEarned, {
                name: user?.name,
                avatar: user?.avatar,
                refBy: user?.refBy,
                totalQuestPointEarned: res?.totalQuestPointEarned
            })

            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res ? res : null
            }
        } catch (error) {
            throw error
        }
    }

    async updateUserWalletAddress(userId: string, walletAddress: string) {
        try {
            const res = await this.userRepository.updateUserWalletAddress(userId, walletAddress)
            return {
                statusCode: status.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: res
            }
        } catch (error) {
            throw error
        }
    }

    async updateRegisterPaymentStatus(userId: string, isRegisteredPayment: boolean = true) {
        return this.userRepository.updateRegisterPaymentStatus(userId, isRegisteredPayment)
    }

    async getUserReferrals(userId: string, query: GetReferralQuery): Promise<ResponseType<GetReferralPagingResponse<GetReferralResponse>>> {
        try {
            const { page, take, sort, sortDirection, refStartDate, refEndDate } = query
            const filter: any = {
                refBy: userId,
                sort: sort,
                sortDirection: sortDirection
            }

            if (refStartDate || refEndDate) {
                filter.refTime = {}
                if (refStartDate) filter.refTime.start = refStartDate
                if (refEndDate) filter.refTime.end = refEndDate
            }

            const res = await this.userRepository.findAllUserReferral(filter, page, take)
            const userInfo = await this.userGameInfoService.getUserGameInfo(userId)

            const pagingMeta = new PageMetaDto({ pageOptionsDto: { page, sort, sortDirection, take }, itemCount: res.total })

            return {
                statusCode: HttpStatus.OK,
                code: MESSAGE_CODES.SUCCESS,
                data: {
                    items: res.items.map((r) => plainToClass(GetReferralResponse, r)),
                    totalLutonEarnedByInvite: userInfo.totalLutonEarnedByInvite,
                    totalFriendInvited: userInfo.totalFriendInvited,
                    meta: pagingMeta
                }
            }
        } catch (error) {
            throw error
        }
    }
}
