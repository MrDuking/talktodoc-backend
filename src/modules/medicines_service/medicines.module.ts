import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MedicineController } from "./medicines.controller";
import { MedicineService } from "./medicines.service";
import { Medicine, MedicineSchema } from "./schemas/medicines.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: Medicine.name, schema: MedicineSchema }])],
    controllers: [MedicineController],
    providers: [MedicineService],
})
export class MedicineModule {}
