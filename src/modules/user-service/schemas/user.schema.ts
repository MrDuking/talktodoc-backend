import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type UserDocument = User & Document

@Schema({ discriminatorKey: "role", timestamps: true }) // Add discriminatorKey
export class User {
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

const UserSchema = SchemaFactory.createForClass(User)

// 🛠 Modify to keep both `_id` and `id`
UserSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret._id.toString() // Duplicate `_id` to `id`
        return ret
    }
})

UserSchema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret._id.toString() // Duplicate `_id` to `id`
        return ret
    }
})

export { UserSchema }
