import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class GeneralSetting {
  @Prop({ type: Array, required: true })
  form_json!: any[];
}

@Schema()
export class FormConfig extends Document {
  @Prop({ type: String, required: true }) // ✅ Lưu raw JSON string
  general_setting!: string;
}
export const FormConfigSchema = SchemaFactory.createForClass(FormConfig);