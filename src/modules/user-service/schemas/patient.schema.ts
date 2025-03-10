import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"
import { User } from "./user.schema"
import { BaseUserSchema } from "./base-user.schema"

export type PatientDocument = Patient & Document

@Schema()
export class Patient extends User {
    @Prop({ required: true })
    dateOfBirth!: string

    @Prop({ required: true })
    gender!: string

    @Prop({ required: true })
    phone!: string

    @Prop({ required: true })
    address!: string

    @Prop([
        {
            condition: { type: String },
            diagnosisDate: { type: String },
            treatment: { type: String }
        }
    ])
    medicalHistory!: Array<{ condition: string; diagnosisDate: string; treatment: string }>

    @Prop([
        {
            doctorId: { type: String },
            date: { type: String },
            time: { type: String },
            status: { type: String, default: "pending" }
        }
    ])
    appointments!: Array<{ doctorId: string; date: string; time: string; status: string }>

    @Prop({
        type: {
            name: { type: String },
            relationship: { type: String },
            phone: { type: String }
        }
    })
    emergencyContact!: { name: string; relationship: string; phone: string }
}

export const PatientSchema = SchemaFactory.createForClass(Patient)
export const PatientModel = BaseUserSchema.discriminator("patient", PatientSchema)
