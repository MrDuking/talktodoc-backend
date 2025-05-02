import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormConfig } from './schemas/form-config.schema.ts';

@Injectable()
export class FormConfigService {
  constructor(
    @InjectModel(FormConfig.name)
    private readonly formConfigModel: Model<FormConfig>,
  ) {}

  async update(id: string, parsedFormJson: any): Promise<FormConfig> {
    const updated = await this.formConfigModel.findByIdAndUpdate(
      id,
      { 'general_setting.form_json': parsedFormJson },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Form config not found');
    }

    return updated;
  }

  async getById(id: string): Promise<FormConfig> {
    const found = await this.formConfigModel.findById(id);
    if (!found) {
      throw new NotFoundException('Form config not found');
    }
    return found;
  }
}
