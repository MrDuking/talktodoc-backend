import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormConfigController } from './form-config.controller';
import { FormConfigService } from './form-config.service';
import { FormConfig, FormConfigSchema } from './schemas/form-config.schema.ts';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormConfig.name, schema: FormConfigSchema },
    ]),
  ],
  controllers: [FormConfigController],
  providers: [FormConfigService],
})
export class FormConfigModule {}