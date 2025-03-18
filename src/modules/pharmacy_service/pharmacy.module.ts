import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PharmacyController } from "./pharmacy.controller";
import { PharmacyService } from "./pharmacy.service";
import { Pharmacy, PharmacySchema } from "./schemas/pharmacy.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: Pharmacy.name, schema: PharmacySchema }])],
    controllers: [PharmacyController],
    providers: [PharmacyService],
    exports: [PharmacyService]
})
export class PharmacyModule {}
