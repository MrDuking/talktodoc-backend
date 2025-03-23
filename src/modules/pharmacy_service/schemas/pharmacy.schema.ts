import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Model } from "mongoose"

export type PharmacyDocument = Pharmacy & Document
export type PharmacyModel = Model<PharmacyDocument>

@Schema({ timestamps: true })
export class Pharmacy {
    @Prop({ unique: true })
    id?: string

    @Prop({ required: true, unique: true })
    name!: string

    @Prop({ required: true })
    address!: string

    @Prop({ required: true, default: "N/A" })
    city!: string

    @Prop({ required: true })
    phoneNumber!: string

    @Prop({ type: [String], default: [] })
    availableMedicines!: string[]

    @Prop({ default: true })
    isActive!: boolean

    @Prop({ default: true })
    active!: boolean

    @Prop({ default: false })
    is24Hours!: boolean
}

export const PharmacySchema = SchemaFactory.createForClass(Pharmacy)
PharmacySchema.pre<PharmacyDocument>("save", async function (next) {
    if (!this.id) {
        let uniqueId
        let isUnique = false
        const PharmacyModel = this.constructor as PharmacyModel

        while (!isUnique) {
            uniqueId = `PH${Math.floor(100000 + Math.random() * 900000)}`
            const existing = await PharmacyModel.findOne({ id: uniqueId }).exec()
            if (!existing) {
                isUnique = true
            }
        }

        this.id = uniqueId
    }
    next()
})
