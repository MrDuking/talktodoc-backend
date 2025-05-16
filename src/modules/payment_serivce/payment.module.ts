// src/payment/payment.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersModule } from '../user-service/user.module'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { OrderMapping, OrderMappingSchema } from './schemas/order-mapping.schema'

@Module({
  imports: [
    // Import the model explicitly with the correct name
    MongooseModule.forFeature([{ name: OrderMapping.name, schema: OrderMappingSchema }]),
    ConfigModule,
    UsersModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
