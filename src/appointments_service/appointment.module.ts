import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentService } from './appointment.service';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { UsersModule } from '@/modules/user-service';
import { MailModule } from '@/modules/mail/mail.module';
import { AppointmentController } from './appointment.controler';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
    UsersModule,
    MailModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
