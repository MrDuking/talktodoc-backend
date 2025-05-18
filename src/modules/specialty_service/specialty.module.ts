import { Doctor, DoctorSchema } from '@modules/user-service/schemas/doctor.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Specialty, SpecialtySchema } from './schemas/specialty.schema'
import { SpecialtyController } from './specialty.controller'
import { SpecialtyService } from './specialty.service'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Specialty.name, schema: SpecialtySchema },

      { name: Doctor.name, schema: DoctorSchema },
    ]),
  ],
  controllers: [SpecialtyController],
  providers: [SpecialtyService],
  exports: [SpecialtyService],
})
export class SpecialtyModule {}
