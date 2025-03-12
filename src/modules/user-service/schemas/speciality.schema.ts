import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SpecialityDocument = Speciality & Document;

@Schema({ timestamps: true })
export class Speciality {
    @Prop({ required: true, unique: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop({ type: [{ type: String }] })
    doctors?: string[];

    @Prop({ type: Object, default: {} })
    config?: Record<string, any>;
}

export const SpecialitySchema = SchemaFactory.createForClass(Speciality);
