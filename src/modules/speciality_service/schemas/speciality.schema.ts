import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Model } from "mongoose";

export type SpecialityDocument = Speciality & Document;
export type SpecialityModel = Model<SpecialityDocument>;

@Schema({ timestamps: true })
export class Speciality {
    @Prop({unique: true })
    id!: string;

    @Prop({ required: true })
    name!: string

    @Prop()
    description?: string

    @Prop({ required: true, default: true })
    active!: boolean

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ type: Map, of: String, default: {} })
    config?: Record<string, any>;
}

export const SpecialitySchema = SchemaFactory.createForClass(Speciality);
SpecialitySchema.pre<SpecialityDocument>("save", async function (next) {
    if (!this.id) {
        let uniqueId;
        let isUnique = false;
        const SpecialityModel = this.constructor as SpecialityModel;

        while (!isUnique) {
            uniqueId = `SP${Math.floor(100000 + Math.random() * 900000)}`;
            const existing = await SpecialityModel.findOne({ id: uniqueId });
            if (!existing) {
                isUnique = true;
            }
        }

        this.id = uniqueId;
    }
    next();
});
