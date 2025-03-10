import { Module, forwardRef } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { AuthModule } from "../auth/auth.module"
import { DoctorController } from "./doctor.controller" // Import DoctorController
import { PatientController } from "./patient.controller"
import { Patient, PatientSchema } from "./schemas"
import { Doctor, DoctorSchema } from "./schemas/doctor.schema" // Import Doctor schema
import { User, UserSchema } from "./schemas/user.schema"
import { UsersController } from "./user.controller"
import { UsersService } from "./user.service"
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Doctor.name, schema: DoctorSchema },
            { name: Patient.name, schema: PatientSchema }
        ]),
        forwardRef(() => AuthModule)
    ],
    providers: [UsersService],
    controllers: [UsersController, DoctorController, PatientController],
    exports: [UsersService]
})
export class UsersModule {}
