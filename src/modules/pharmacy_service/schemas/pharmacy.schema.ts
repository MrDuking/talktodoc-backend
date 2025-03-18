import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type PharmacyDocument = Pharmacy & Document;

@Schema({ timestamps: true })
export class Pharmacy {
    @Prop({ required: true, unique: true, default: () => `PH${Math.floor(100000 + Math.random() * 900000)}` })
    id!: string;

    @Prop({ required: true, unique: true })
    name!: string;

    @Prop({ required: true })
    address!: string;

    @Prop({ required: true })
    phoneNumber!: string;

    @Prop({ type: [String], default: [] })
    availableMedicines!: string[];
}

export const PharmacySchema = SchemaFactory.createForClass(Pharmacy);
