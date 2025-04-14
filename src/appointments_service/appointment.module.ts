import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controler';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { SpecialityModule } from '@modules/speciality_service/speciality.module';
import { UsersModule } from '@modules/user-service/user.module';
import { PaymentModule } from '@modules/payment_serivce/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
    SpecialityModule,
    UsersModule,
    PaymentModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}