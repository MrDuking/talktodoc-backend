import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SpecialityController } from "./speciality.controller";
import { SpecialityService } from "./speciality.service";
import { Speciality, SpecialitySchema } from "./schemas/speciality.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: Speciality.name, schema: SpecialitySchema }])],
    controllers: [SpecialityController],
    providers: [SpecialityService],
    exports: [SpecialityService],
})
export class SpecialityModule {}
