import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Model } from "mongoose";
import { BaseUser } from "./base-user.schema";
import { UserRole } from "@common/enum/user_role.enum";

export type PatientDocument = Patient & Document;

enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other",
}

@Schema()
class MedicalHistory {
    @Prop({ required: true })
    condition!: string;

    @Prop({ type: Date, required: true })
    diagnosisDate!: Date;

    @Prop({ required: true })
    treatment!: string;
}

@Schema()
class Appointment {
    @Prop({ required: true })
    doctorId!: string;

    @Prop({ type: Date, required: true })
    date!: Date;

    @Prop({ type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" })
    status!: string;
}

@Schema()
export class Patient extends BaseUser {
    @Prop({ required: true })
    id!: string;

    @Prop({ default: UserRole.PATIENT })
    role!: UserRole;

    @Prop({ type: String, enum: Object.values(Gender), required: true })
    gender!: Gender;

    @Prop({ required: true })
    address!: string;

    @Prop({ type: [MedicalHistory], default: [] })
    medicalHistory!: MedicalHistory[];

    @Prop({ type: [Appointment], default: [] })
    appointments!: Appointment[];

    @Prop({
        type: {
            name: { type: String, required: true },
            relationship: { type: String, required: true },
            phoneNumber: { type: String, required: true }
        },
        required: true
    })
    emergencyContact!: { name: string; relationship: string; phoneNumber: string };
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
PatientSchema.pre<PatientDocument>("save", async function (next) {
    if (!this.id) {
        let uniqueId;
        let isUnique = false;
        const PatientModel = this.constructor as Model<PatientDocument>;

        while (!isUnique) {
            uniqueId = `PT${Math.floor(100000 + Math.random() * 900000)}`;
            const existing = await PatientModel.findOne({ id: uniqueId });
            if (!existing) {
                isUnique = true;
            }
        }

        this.id = uniqueId;
    }
    next();
});
