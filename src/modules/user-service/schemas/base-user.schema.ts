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

    @Prop({ default: "user", enum: ["user", "admin", "doctor", "patient"] })
    role!: string

    @Prop()
    fullName!: string
}

export const BaseUserSchema = SchemaFactory.createForClass(BaseUser)
