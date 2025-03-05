import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ResponseType } from "src/common"
import { MESSAGE_CODES } from "src/common/constants"
import { CreateUserReferralRequestDto, GetRefByResponseDto } from "./dtos"
import { UserRefferalRepository } from "./repositories"
import { UserReferral } from "./schemas"

@Injectable()
export class UserReferralService {
    constructor(
        @InjectModel(UserReferral.name) private userReferralModel: Model<UserReferral>,
        private readonly userRefferalRepository: UserRefferalRepository
    ) {}

    async getRefBy(userId: string, server?: number): Promise<string | null> {
        const userReferral = server ? await this.userRefferalRepository.findUserRefBy(userId, server) : await this.userRefferalRepository.findUserRefById(userId)

        return userReferral ? userReferral.refBy : null
    }

    async getReferrals(
        filter: {
            refBy?: string
            server?: number
            refTime?: { start?: Date; end?: Date }
        } = {},
        page: number = 1,
        limit: number = 10
    ): Promise<{
        referrals: UserReferral[]
        total: number
        page: number
        pages: number
    }> {
        const skip = (page - 1) * limit

        const query: any = {}

        if (filter.refBy) {
            query.refBy = { $regex: filter.refBy, $options: "i" }
        }
        if (filter.server !== undefined) {
            query.server = filter.server
        }
        if (filter.refTime) {
            query.refTime = {}
            if (filter.refTime.start) {
                query.refTime.$gte = filter.refTime.start
            }
            if (filter.refTime.end) {
                query.refTime.$lte = filter.refTime.end
            }
        }

        const [referrals, total] = await Promise.all([
            this.userReferralModel.find(query).skip(skip).limit(limit).sort({ refTime: -1 }).exec(),
            this.userReferralModel.countDocuments(query)
        ])

        const pages = Math.ceil(total / limit)

        return {
            referrals,
            total,
            page,
            pages
        }
    }

    async getRefTime(userId: string, server: number): Promise<Date | null> {
        const userReferral = await this.userReferralModel.findOne({ userId, server }).exec()
        return userReferral ? userReferral.refTime : null
    }

    async getuserIdsByServer(server: number, page: number = 1, limit: number = 10): Promise<{ userIds: string[]; total: number; page: number; pages: number }> {
        const skip = (page - 1) * limit

        const query = { server }

        const [userIds, total] = await Promise.all([
            this.userReferralModel.find(query).skip(skip).limit(limit).select("userId").sort({ userId: 1 }).exec(),
            this.userReferralModel.countDocuments(query)
        ])

        const pages = Math.ceil(total / limit)

        return {
            userIds: userIds.map((doc) => doc.userId),
            total,
            page,
            pages
        }
    }

    async getDataByQuery(query: { userId?: string; refBy?: string; server?: number }): Promise<UserReferral[]> {
        return this.userReferralModel.find(query).exec()
    }

    async createReferral(referralData: CreateUserReferralRequestDto) {
        try {
            const newReferral = new this.userReferralModel(referralData)

            return {
                code: MESSAGE_CODES.SUCCESS,
                data: await newReferral.save()
            }
        } catch (error) {
            if (error.code === 11000) {
                // MongoDB duplicate key error code
                throw new HttpException("This user-referrer pair already exists for the given server", HttpStatus.BAD_REQUEST, {
                    cause: {
                        code: MESSAGE_CODES.DUPLICATE_USER_REFERRAL
                    }
                })
            }
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    async getRefByGrpcMethod(userId: string, server?: number): Promise<ResponseType<GetRefByResponseDto>> {
        const userReferral = server ? await this.userRefferalRepository.findUserRefBy(userId, server) : await this.userRefferalRepository.findUserRefById(userId)

        return {
            code: MESSAGE_CODES.SUCCESS,
            data: {
                refCode: userReferral ? userReferral.refBy : null
            }
        }
    }
}
