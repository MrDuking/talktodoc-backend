import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Model } from "mongoose";
import { BaseUser } from "./base-user.schema";
import { UserRole } from "@common/enum/user_role.enum";

export type DoctorDocument = Doctor & Document;
export type DoctorModel = Model<DoctorDocument>;

@Schema()
class Availability {
    @Prop({ required: true })
    date!: string;

    @Prop({ type: [String], required: true })
    timeSlots!: string[];
}

@Schema({ timestamps: true })
export class Doctor extends BaseUser {
    @Prop({ unique: true })
    id!: string;

    @Prop({ default: UserRole.DOCTOR })
    role!: UserRole;

    @Prop({ type: [String], required: true, ref: "Speciality" })
    specialty!: string[];

    @Prop({ required: true })
    hospitalId!: string;

    @Prop({ default: 0 })
    experienceYears!: number;

    @Prop()
    licenseNo!: string;

    @Prop({ type: [Availability], default: [] })
    availability!: Availability[];

    @Prop({ type: String, required: true, ref: "DoctorLevel" })
    rank!: string;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

DoctorSchema.pre<DoctorDocument>("save", async function (next) {
    if (!this.id) {
        let uniqueId;
        let isUnique = false;
        const DoctorModel = this.constructor as DoctorModel;

        while (!isUnique) {
            uniqueId = `DR${Math.floor(100000 + Math.random() * 900000)}`;
            const existing = await DoctorModel.findOne({ id: uniqueId });
            if (!existing) {
                isUnique = true;
            }
        }

        this.id = uniqueId;
    }
    next();
});
