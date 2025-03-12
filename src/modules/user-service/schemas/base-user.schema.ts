import { UserRole } from "@common/enum/user_role.enum"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type BaseUserDocument = BaseUser & Document

@Schema({ discriminatorKey: "role", timestamps: true })
export class BaseUser {
    @Prop({ required: true, unique: true })
    username!: string

    @Prop({ required: true })
    password!: string

    @Prop({ required: true, unique: true })
    email!: string

    @Prop()
    fullName!: string

    @Prop({ required: true })
    phoneNumber!: string

    @Prop()
    birthDate!: string
}

export const BaseUserSchema = SchemaFactory.createForClass(BaseUser)

BaseUserSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret._id.toString()
        return ret
    }
})

BaseUserSchema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret._id.toString()
        return ret
    }
})
