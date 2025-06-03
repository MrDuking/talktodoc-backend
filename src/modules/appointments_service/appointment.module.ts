import { MailModule } from '@/modules/mail/mail.module'
import { PaymentModule } from '@/modules/payment_serivce/payment.module'
import {
  OrderMapping,
  OrderMappingSchema,
} from '@/modules/payment_serivce/schemas/order-mapping.schema'
import { UsersModule } from '@/modules/user-service'
import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Case, CaseSchema } from '../case/schemas/case.schema'
import { AppointmentController } from './appointment.controler'
import { AppointmentService } from './appointment.service'
import { Appointment, AppointmentSchema } from './schemas/appointment.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Case.name, schema: CaseSchema },
      { name: OrderMapping.name, schema: OrderMappingSchema },
    ]),

    UsersModule,
    MailModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
