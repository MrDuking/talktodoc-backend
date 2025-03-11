import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"
import { BaseUserSchema } from "./base-user.schema"
import { User } from "./user.schema"
export type DoctorDocument = Doctor & Document

@Schema()
export class Doctor extends User {

    @Prop({ required: true })
    specialty!: string[]

    @Prop({ required: true })
    hospitalId!: string

    @Prop({ required: true })
    phoneNumber!: string

    @Prop({ default: 0 })
    experienceYears!: number

    @Prop()
    licenseNo!: string

    @Prop([{ date: String, timeSlots: [String] }])
    availability!: Array<{ date: string; timeSlots: string[] }>

    @Prop()
    rank!: string
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor)
export const DoctorModel = BaseUserSchema.discriminator("doctor", DoctorSchema) // Áp dụng discriminator
