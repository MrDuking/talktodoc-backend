import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { UserReferral, UserReferralDocument } from "../schemas"

@Injectable()
export class UserRefferalRepository {
    constructor(
        @InjectModel(UserReferral.name)
        private readonly userRefferalModel: Model<UserReferralDocument>
    ) {}

    async findUserRefById(userId: string) {
        return await this.userRefferalModel.findOne({ userId: userId }).exec()
    }

    async findUserRefBy(userId: string, server: number) {
        return await this.userRefferalModel.findOne({ userId: userId, server: server }).exec()
    }
}
