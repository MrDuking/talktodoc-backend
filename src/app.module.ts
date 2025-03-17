import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { AuthModule } from "./modules/auth/auth.module"
import { PharmacyModule } from "./modules/pharmacy_service/pharmacy.module"
import { UsersModule } from "./modules/user-service/user.module"
import { SpecialityModule } from "./modules/speciality_service/speciality.module"

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
        SpecialityModule
    ]
})
export class AppModule {}
