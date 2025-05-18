import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import vnpayConfig from './config/vnpay_config/vnpay.config'
import { AppointmentModule } from './modules/appointments_service/appointment.module'
import { AuthModule } from './modules/auth/auth.module'
import { CaseModule } from './modules/case/case.module'
import { ChatModule } from './modules/chat-bot-service/chat.module'
import { ContactModule } from './modules/contact-service/mail.module'
import { DoctorLevelModule } from './modules/doctor_levels_service/doctor-level.module'
import { FormConfigModule } from './modules/form-config-service/form-config.module'
import { HospitalModule } from './modules/hospitals_service/hospital.module'
import { MailModule } from './modules/mail/mail.module'
import { MedicineModule } from './modules/medicines_service/medicines.module'
import { OtpModule } from './modules/otp_service/otp.module'
import { PaymentModule } from './modules/payment_serivce/payment.module'
import { PharmacyModule } from './modules/pharmacy_service/pharmacy.module'
import { SpecialtyModule } from './modules/specialty_service/specialty.module'
import { UsersModule } from './modules/user-service/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [vnpayConfig],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('DB_NAME'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    MailModule,
    AuthModule,
    PharmacyModule,
    SpecialtyModule,
    DoctorLevelModule,
    MedicineModule,
    HospitalModule,
    ContactModule,
    OtpModule,
    AppointmentModule,
    FormConfigModule,
    ChatModule,
    CaseModule,
    PaymentModule,
  ],
})
export class AppModule {}
