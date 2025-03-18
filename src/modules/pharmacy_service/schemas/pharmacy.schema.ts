import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { nanoid } from "nanoid";

export type PharmacyDocument = Pharmacy & Document;

@Schema({ timestamps: true })
export class Pharmacy {
    @Prop({ required: true, unique: true, default: () => `PH${nanoid(6)}` })
    id!: string;

    @Prop({ required: true, unique: true })
    name!: string;

    @Prop({ required: true })
    address!: string;

    @Prop({ required: true })
    phoneNumber!: string;

    @Prop({ type: [String], default: [] })
    availableMedicines!: string[];

    @Prop({ default: true })
    active!: boolean;

    @Prop({ default: false })
    is24Hours!: boolean;
}

export const PharmacySchema = SchemaFactory.createForClass(Pharmacy);
