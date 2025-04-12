import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EmailOtp extends Document {
  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  otp!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ default: false })
  isVerified!: boolean;
}

export const EmailOtpSchema = SchemaFactory.createForClass(EmailOtp);