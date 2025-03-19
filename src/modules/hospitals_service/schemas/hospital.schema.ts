import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Model } from "mongoose";

export type HospitalDocument = Hospital & Document;
export type HospitalModel = Model<HospitalDocument>;

@Schema({ timestamps: true })
export class Hospital {
    @Prop({ unique: true })
    id!: string;

    @Prop({ required: true, unique: true })
    name!: string;

    @Prop({ required: true })
    address!: string;

    @Prop({ required: true })
    phoneNumber!: string;

    @Prop({ type: [String], required: true, ref: "Speciality" })
    specialty!: string[];

    @Prop({ default: false })
    isPublic!: boolean;

    @Prop({ default: true })
    isActive!: boolean;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);

HospitalSchema.pre<HospitalDocument>("save", async function (next) {
    if (!this.id) {
        let uniqueId;
        let isUnique = false;
        const HospitalModel = this.constructor as HospitalModel;

        while (!isUnique) {
            uniqueId = `HS${Math.floor(100000 + Math.random() * 900000)}`;
            const existing = await HospitalModel.findOne({ id: uniqueId }).exec();
            if (!existing) {
                isUnique = true;
            }
        }

        this.id = uniqueId;
    }
    next();
});
