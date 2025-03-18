import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { BaseUser } from "./base-user.schema";
import { UserRole } from "@common/enum/user_role.enum";
import { Speciality } from "@modules/speciality_service/schemas/speciality.schema";
import { nanoid } from "nanoid";

export type DoctorDocument = Doctor & Document;

@Schema({ timestamps: true })
export class Doctor extends BaseUser {
    @Prop({ required: true, unique: true, default: () => `DR${nanoid(6)}` })
    id!: string;

    @Prop({ default: UserRole.DOCTOR })
    role!: UserRole;

    @Prop({ type: [{ type: Types.ObjectId, ref: "Speciality" }] })
    specialty!: Speciality[];

    @Prop({ required: true })
    hospitalId!: string;

    @Prop({ default: 0 })
    experienceYears!: number;

    @Prop()
    licenseNo!: string;

    @Prop({ type: [{ date: { type: String }, timeSlots: { type: [String] } }] })
    availability!: Array<{ date: string; timeSlots: string[] }>;

    @Prop()
    rank!: string;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
