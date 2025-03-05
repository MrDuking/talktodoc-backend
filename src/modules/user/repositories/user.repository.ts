import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, SortOrder } from "mongoose"
import { SortDirection, User } from "src/common"
import { UserInventoryService } from "src/modules/user-inventory/user-inventory.service"

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User, UserInventoryService>) {}

    async findAll(): Promise<User[]> {
        return this.userModel.find({ deletedAt: null })
    }

    async findOneAndUpdate(id: string, cmdUpdate: Partial<User>, options: { new: boolean }): Promise<User> {
        const updatedUser = await this.userModel.findOneAndUpdate({ id, deletedAt: null }, cmdUpdate, options)
        if (!updatedUser) {
            throw new NotFoundException(`User with id ${id} not found`)
        }
        return updatedUser
    }

    async createNewUser(user: User): Promise<User> {
        return this.userModel.create({ ...user, username: user.name })
    }

    async findOneById(id: string): Promise<User | null> {
        return this.userModel.findOne({ id, deletedAt: null }).lean().exec()
    }

    async findAllPaginated(query: any, skip: number, take: number): Promise<User[]> {
        return this.userModel
            .find(query) // adjust filter if necessary
            .skip(skip)
            .limit(take)
            .lean()
            .exec()
    }

    async countUsers(query: any): Promise<number> {
        return this.userModel
            .countDocuments(query) // adjust filter if necessary
            .exec()
    }

    async updateUserPrenium(userId: string, status: boolean): Promise<User | null> {
        return this.userModel.findOneAndUpdate({ id: userId }, { isTelegramPremiumUser: status }, { new: true }).lean()
    }

    async updateUserAvatar(userId: string, avatar: string): Promise<User | null> {
        return this.userModel.findOneAndUpdate({ id: userId }, { avatar: avatar }, { new: true }).lean()
    }

    async updateUserRefBy(userId: string, refBy: string): Promise<User | null> {
        return this.userModel.findOneAndUpdate({ id: userId, refBy: "" }, { refBy: refBy }, { new: true }).lean()
    }

    async findUserByRefCode(refCode: string): Promise<User | null> {
        return this.userModel.findOne({ refCode: refCode }).lean()
    }

    async updateUserWalletAddress(userId: string, walletAddress: string) {
        return this.userModel.findOneAndUpdate({ id: userId }, { walletAddress: walletAddress }, { new: true }).lean()
    }

    async updateRegisterPaymentStatus(userId: string, isRegisteredPayment: boolean) {
        return this.userModel.findOneAndUpdate({ id: userId }, { isRegisteredPayment: isRegisteredPayment }, { new: true }).lean()
    }

    async findAllUserReferral(
        filter: { refBy: string; refTime?: { start?: Date; end?: Date }; sort: string; sortDirection: SortDirection },
        page: number = 1,
        limit: number = 10
    ): Promise<{ total: number; items: User[] }> {
        const offset = (page - 1) * limit
        const query: any = {}

        query.refBy = filter.refBy
        if (filter.refTime) {
            query.refTime = {}
            if (filter.refTime.start) query.refTime.$gte = filter.refTime.start
            if (filter.refTime.end) query.refTime.$lte = filter.refTime.end
        }

        const validSortFields = ["createdAt", "refTime"]
        const sortOption: Record<string, SortOrder> = {}
        if (validSortFields.includes(filter.sort)) {
            sortOption[filter.sort] = filter.sortDirection === SortDirection.ASC ? 1 : -1
        } else {
            sortOption["createdAt"] = -1
        }

        const [total, items] = await Promise.all([
            this.userModel.countDocuments({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], refBy: filter.refBy }),
            this.userModel
                .find({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }], ...query })
                .skip(offset)
                .limit(limit)
                .sort(sortOption)
                .lean()
        ])

        return {
            total,
            items
        }
    }
}
