import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MedicineDocument = Medicine & Document;

@Schema()
export class Medicine {
  @Prop({ required: true })
  id!: number;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  route!: string;

  @Prop()
  dose!: number;

  @Prop()
  quantity!: number;

  @Prop()
  frequency!: number;

  @Prop()
  refill!: number;

  @Prop()
  finalCost!: number;

  @Prop()
  feeCost!: number;

  @Prop()
  prescriptionFee!: number;
}

export const MedicineSchema = SchemaFactory.createForClass(Medicine);
