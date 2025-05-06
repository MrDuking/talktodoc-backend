import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { OtpService } from './otp.service'
import { OtpController } from './otp.controller'
import { EmailOtp, EmailOtpSchema } from './schemas/email-otp.schema'
import {
    Doctor,
    Patient,
    Employee,
    DoctorSchema,
    PatientSchema,
    EmployeeSchema
  } from "@modules/user-service/schemas"


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailOtp.name, schema: EmailOtpSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ])
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
