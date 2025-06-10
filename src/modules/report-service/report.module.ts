import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Appointment, AppointmentSchema } from '../appointments_service/schemas/appointment.schema'
import { OrderMapping, OrderMappingSchema } from '../payment_serivce/schemas/order-mapping.schema'
import { Specialty, SpecialtySchema } from '../specialty_service/schemas/specialty.schema'
import { Doctor, DoctorSchema } from '../user-service/schemas/doctor.schema'
import { Patient, PatientSchema } from '../user-service/schemas/patient.schema'
import { ReportController } from './report.controller'
import { ReportService } from './report.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: OrderMapping.name, schema: OrderMappingSchema },
      { name: Specialty.name, schema: SpecialtySchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
