import { Doctor, DoctorSchema } from '@modules/user-service/schemas/doctor.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Speciality, SpecialitySchema } from './schemas/speciality.schema'
import { SpecialityController } from './speciality.controller'
import { SpecialityService } from './speciality.service'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Speciality.name, schema: SpecialitySchema },
      { name: Doctor.name, schema: DoctorSchema },
    ]),
  ],
  controllers: [SpecialityController],
  providers: [SpecialityService],
  exports: [SpecialityService],
})
export class SpecialityModule {}
