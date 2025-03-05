import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { BaseSchema } from "src/common"

export type UserReferralDocument = HydratedDocument<UserReferral>

const COLLECTION_NAME = "user_referrals"
@Schema({
    collection: COLLECTION_NAME,
    timestamps: true,
    versionKey: false
})
export class UserReferral extends BaseSchema {
    @Prop({ required: true })
    userId: string

    @Prop({ nullable: true })
    refBy: string

    @Prop({ nullable: true })
    refTime: Date

    @Prop({ default: 1 })
    server: number
}

export const UserReferralSchema = SchemaFactory.createForClass(UserReferral)
UserReferralSchema.index({ userId: 1, refBy: 1 }, { unique: true })
UserReferralSchema.index({ userId: 1, server: 1 })
UserReferralSchema.index({ refBy: 1, server: 1 })
