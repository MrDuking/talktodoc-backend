import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BaseUserDocument = BaseUser & Document;

class City {
    @Prop({ required: true })
    name!: string;

    @Prop({ required: true })
    code!: number;

    @Prop({ required: true })
    division_type!: string;

    @Prop({ required: true })
    codename!: string;

    @Prop({ required: true })
    phone_code!: number;

    @Prop({ type: [Object], default: [] })
    districts?: any[];
}

@Schema({ timestamps: true })
export class BaseUser {
    @Prop({ required: true, unique: true })
    username!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ required: true, unique: true })
    email!: string;

    @Prop()
    fullName!: string;

    @Prop({ required: true })
    phoneNumber!: string;

    @Prop({ type: Date })
    birthDate!: Date;

    @Prop({ default: true })
    isActive!: boolean;

    @Prop()
    avatar?: string;

    @Prop({ type: City, default: null })
    city?: City;
}

export const BaseUserSchema = SchemaFactory.createForClass(BaseUser);

BaseUserSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        return ret;
    }
});

BaseUserSchema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        return ret;
    }
});