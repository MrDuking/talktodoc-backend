import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import {
  OrderMapping,
  OrderMappingSchema,
} from './schemas/order-mapping.schema';
import { UsersModule } from '../user-service/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderMapping.name, schema: OrderMappingSchema },
    ]),
    ConfigModule,
    UsersModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}