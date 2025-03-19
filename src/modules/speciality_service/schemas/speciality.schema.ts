import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { nanoid } from "nanoid";

export type SpecialityDocument = Speciality & Document;

@Schema()
export class Speciality {
    @Prop({ required: true, unique: true, default: () => `SP${nanoid(6)}` })
    id!: string

    @Prop({ required: true })
    name!: string

    @Prop()
    description?: string

    @Prop({ required: true, default: true })
    active!: boolean

    @Prop({ type: Object })
    config?: Record<string, any>
}

export const SpecialitySchema = SchemaFactory.createForClass(Speciality);
