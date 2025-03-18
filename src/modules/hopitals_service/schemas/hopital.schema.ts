import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type HospitalDocument = Hospital & Document;

@Schema()
export class Hospital {
    @Prop({ required: true, unique: true, default: () => `HS${Math.floor(100000 + Math.random() * 900000)}` })
    id!: string;

    @Prop({ required: true })
    name!: string;

    @Prop({ required: true })
    address!: string;

    @Prop({ required: true })
    phoneNumber!: string;

    @Prop({ type: [String], default: [] })
    specialities!: string[];

    @Prop({ default: false })
    isPublic!: boolean;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);
