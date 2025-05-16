import {
  Doctor,
  DoctorSchema,
  Employee,
  EmployeeSchema,
  Patient,
  PatientSchema,
} from '@modules/user-service/schemas'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { OtpController } from './otp.controller'
import { OtpService } from './otp.service'
import { EmailOtp, EmailOtpSchema } from './schemas/email-otp.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailOtp.name, schema: EmailOtpSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
