import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DoctorLevelController } from "./doctor-level.controller";
import { DoctorLevelService } from "./doctor-level.service";
import { DoctorLevel, DoctorLevelSchema } from "./schemas/doctor-level.schema";
import { Doctor, DoctorSchema } from "@modules/user-service/schemas/doctor.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DoctorLevel.name, schema: DoctorLevelSchema },
            { name: Doctor.name, schema: DoctorSchema }
        ])
    ],
    controllers: [DoctorLevelController],
    providers: [DoctorLevelService],
    exports: [DoctorLevelService]
})
export class DoctorLevelModule {}
