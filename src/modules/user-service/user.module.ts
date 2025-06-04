import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Appointment, AppointmentSchema } from '../appointments_service/schemas/appointment.schema'
import { AuthModule } from '../auth/auth.module'
import {
  DoctorLevel,
  DoctorLevelSchema,
} from '../doctor_levels_service/schemas/doctor-level.schema'
import { Hospital, HospitalSchema } from '../hospitals_service/schemas'
import { MailModule } from '../mail/mail.module'
import { Specialty, SpecialtySchema } from '../specialty_service/schemas/specialty.schema'
import { DoctorController } from './doctor/doctor.controller'
import { EmployeeController } from './employee/employee.controller'
import { PatientController } from './patient/patient.controller'
import {
  Doctor,
  DoctorSchema,
  Employee,
  EmployeeSchema,
  Patient,
  PatientSchema,
} from './schemas/index'
import { UsersService } from './user.service'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Specialty.name, schema: SpecialtySchema },
      { name: Hospital.name, schema: HospitalSchema },
      { name: DoctorLevel.name, schema: DoctorLevelSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    forwardRef(() => AuthModule),
    MailModule,
  ],
  providers: [UsersService],
  controllers: [EmployeeController, DoctorController, PatientController],
  exports: [UsersService],
})
export class UsersModule {}
