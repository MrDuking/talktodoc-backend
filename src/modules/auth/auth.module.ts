import { Module, forwardRef } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { MongooseModule } from "@nestjs/mongoose"
import { PassportModule } from "@nestjs/passport"

import { UsersModule } from "../user-service/user.module"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { JwtStrategy, LocalStrategy } from "./strategies/index"

import { Admin, AdminSchema } from "../user-service/schemas/admin.schema"
import { Doctor, DoctorSchema } from "../user-service/schemas/doctor.schema"
import { Employee, EmployeeSchema } from "../user-service/schemas/employee.schema"
import { Patient, PatientSchema } from "../user-service/schemas/patient.schema"
import { EmailOtp, EmailOtpSchema } from "../otp_service/schemas/email-otp.schema"

@Module({
    imports: [
        ConfigModule,
        forwardRef(() => UsersModule),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: { expiresIn: configService.get<string>("JWT_EXPIRES_IN") }
            }),
            inject: [ConfigService]
        }),
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: Doctor.name, schema: DoctorSchema },
            { name: Employee.name, schema: EmployeeSchema },
            { name: Patient.name, schema: PatientSchema },
            { name: EmailOtp.name, schema: EmailOtpSchema }
        ])
    ],
    providers: [AuthService, JwtStrategy, LocalStrategy],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule {}
