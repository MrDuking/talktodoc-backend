import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseUser, BaseUserSchema } from "./base-user.schema";
import { UserRole } from "@common/enum/user_role.enum";

export type DoctorDocument = Doctor & Document;

@Schema()
export class Doctor extends BaseUser {
    @Prop({ type: [String], required: true })
    specialty!: string[];

    @Prop({ required: true })
    hospitalId!: string;

    @Prop({ default: 0 })
    experienceYears!: number;

    @Prop()
    licenseNo!: string;

    @Prop({
        type: [
            {
                date: { type: String },
                timeSlots: { type: [String] }
            }
        ]
    })
    availability!: Array<{ date: string; timeSlots: string[] }>;

    @Prop()
    rank!: string;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
export const DoctorModel = BaseUserSchema.discriminator(UserRole.DOCTOR, DoctorSchema);
