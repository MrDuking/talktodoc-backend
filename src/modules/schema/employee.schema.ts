import { UserRole } from "@common/enum/user_role.enum"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Model, Types } from "mongoose"
import { BaseUser } from "./base-user.schema"

export type EmployeeDocument = Employee & Document
export type EmployeeModel = Model<EmployeeDocument>

@Schema({ timestamps: true })
export class Employee extends BaseUser {
    @Prop({ unique: true })
    id!: string

    @Prop({ default: UserRole.EMPLOYEE })
    role!: UserRole

    @Prop({ required: true })
    position!: string

    @Prop({ required: false })
    department?: string

    @Prop({ type: [Types.ObjectId], required: true, ref: "Speciality" })
    specialty!: Types.ObjectId[]

    @Prop({ type: Date, required: false })
    startDate!: Date

    @Prop({ default: 0 })
    salary?: number

    @Prop()
    contractType?: string
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee)

/**
 * Middleware đảm bảo `id` là duy nhất
 */
EmployeeSchema.pre<EmployeeDocument>("save", async function (next) {
    if (!this.id) {
        let uniqueId
        let isUnique = false
        const EmployeeModel = this.constructor as EmployeeModel
        while (!isUnique) {
            uniqueId = `EM${Math.floor(100000 + Math.random() * 900000)}`
            const existing = await EmployeeModel.findOne({ id: uniqueId })
            if (!existing) {
                isUnique = true
            }
        }

        this.id = uniqueId
    }
    next()
})
