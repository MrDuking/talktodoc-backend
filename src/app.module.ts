import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { AuthModule } from "./modules/auth/auth.module"
import { PharmacyModule } from "./modules/pharmacy_service/pharmacy.module"
import { UsersModule } from "./modules/user-service/user.module"
import { SpecialityModule } from "./modules/speciality_service/speciality.module"
import { HospitalModule } from "./modules/hospitals_service/hospital.module";
import { DoctorLevelModule } from "./modules/doctor_levels_service/doctor-level.module"
import { MedicineModule } from "./modules/medicines_service/medicines.module"

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>("MONGODB_URI"),
                dbName: configService.get<string>("DB_NAME")
            }),
            inject: [ConfigService]
        }),
        UsersModule,
        AuthModule,
        PharmacyModule,
        SpecialityModule,
        DoctorLevelModule,
        MedicineModule,
        HospitalModule
    ]
})
export class AppModule {}
