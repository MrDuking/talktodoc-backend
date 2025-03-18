import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HospitalController, HospitalService } from "./index";
import { Hospital, HospitalSchema } from "./schemas/hopital.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: Hospital.name, schema: HospitalSchema }])],
    controllers: [HospitalController],
    providers: [HospitalService],
    exports: [HospitalService],
})
export class HospitalModule {}
