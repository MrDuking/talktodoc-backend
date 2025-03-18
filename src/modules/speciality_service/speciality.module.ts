import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SpecialityController } from "./speciality.controller";
import { SpecialityService } from "./speciality.service";
import { Speciality, SpecialitySchema } from "./schemas/speciality.schema";
import { Doctor, DoctorSchema } from "@modules/user-service/schemas/doctor.schema";
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Speciality.name, schema: SpecialitySchema },
            { name: Doctor.name, schema: DoctorSchema }
        ])
    ],
    controllers: [SpecialityController],
    providers: [SpecialityService],
    exports: [SpecialityService]
})
export class SpecialityModule {}
