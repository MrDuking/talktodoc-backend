import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true })
  orderId!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: false })
  bankCode?: string;

  @Prop({ required: false })
  cardType?: string;

  @Prop({ required: false })
  payDate?: string;

  @Prop({ required: false })
  responseCode?: string;

  @Prop({ required: false })
  transactionNo?: string;

  @Prop({ required: false })
  transactionStatus?: string;

  @Prop({ default: 'pending' })
  status?: 'pending' | 'success' | 'fail';
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
