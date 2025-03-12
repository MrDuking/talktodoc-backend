import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseUser, BaseUserSchema } from "./base-user.schema";
import { UserRole } from "@common/enum/user_role.enum";

export type PatientDocument = Patient & Document;

@Schema()
export class Patient extends BaseUser {
    @Prop({ required: true })
    gender!: string;

    @Prop({ required: true })
    address!: string;

    @Prop({
        type: [
            {
                condition: { type: String },
                diagnosisDate: { type: String },
                treatment: { type: String }
            }
        ]
    })
    medicalHistory!: Array<{ condition: string; diagnosisDate: string; treatment: string }>;

    @Prop({
        type: [
            {
                doctorId: { type: String },
                date: { type: String },
                time: { type: String },
                status: { type: String, default: "pending" }
            }
        ]
    })
    appointments!: Array<{ doctorId: string; date: string; time: string; status: string }>;

    @Prop({
        type: {
            name: { type: String },
            relationship: { type: String },
            phoneNumber: { type: String }
        }
    })
    emergencyContact!: { name: string; relationship: string; phoneNumber: string };
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
export const PatientModel = BaseUserSchema.discriminator(UserRole.PATIENT, PatientSchema);
