// src/payment/payment.module.ts
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AppointmentModule } from '../appointments_service/appointment.module'
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
    forwardRef(() => AppointmentModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
