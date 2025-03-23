import { UserRole } from "@common/enum/user_role.enum"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Model, Types } from "mongoose"
import { BaseUser } from "./base-user.schema"

export type DoctorDocument = Doctor & Document
export type DoctorModel = Model<DoctorDocument>

@Schema()
class Availability {
    @Prop({ required: true })
    date!: string

    @Prop({ type: [String], required: true })
    timeSlots!: string[]
}

@Schema({ timestamps: true })
export class Doctor extends BaseUser {
    @Prop({ unique: true })
    id!: string 

    @Prop({ default: UserRole.DOCTOR })
    role!: UserRole

    @Prop({ type: [Types.ObjectId], required: true, ref: "Speciality" })
    specialty!: Types.ObjectId[]

    @Prop({ type: Types.ObjectId, required: true, ref: "Hospital" })
    hospital!: Types.ObjectId

    @Prop({ default: 0 })
    experienceYears!: number

    @Prop()
    licenseNo!: string

    @Prop({ type: [Availability], default: [] })
    availability!: Availability[]

    @Prop({ type: Types.ObjectId, required: true, ref: "DoctorLevel" })
    rank!: Types.ObjectId
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor)

DoctorSchema.pre<DoctorDocument>("save", async function (next) {
    if (!this.id) {
        let uniqueId
        let isUnique = false
        const DoctorModel = this.constructor as DoctorModel

        while (!isUnique) {
            uniqueId = `DR${Math.floor(100000 + Math.random() * 900000)}`
            const existing = await DoctorModel.findOne({ id: uniqueId })
            if (!existing) {
                isUnique = true
            }
        }

        this.id = uniqueId
    }
    next()
})
