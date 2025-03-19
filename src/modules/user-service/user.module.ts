import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { EmployeeController } from "./employee/employee.controller";
import { DoctorController } from "./doctor/doctor.controller";
import { PatientController } from "./patient/patient.controller";
import { SpecialityController } from "../speciality_service/speciality.controller";
import { BaseUser, BaseUserSchema, Doctor, DoctorSchema, Employee, EmployeeSchema, Patient, PatientSchema } from "./schemas/index";
import { UsersService } from "./user.service";
import { Speciality, SpecialitySchema } from "../speciality_service/schemas/speciality.schema";
import { DoctorLevel, DoctorLevelSchema } from "../doctor_levels_service/schemas/doctor-level.schema";
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: BaseUser.name, schema: BaseUserSchema },
            { name: Doctor.name, schema: DoctorSchema },
            { name: Employee.name, schema: EmployeeSchema },
            { name: Patient.name, schema: PatientSchema },
            { name: Speciality.name, schema: SpecialitySchema },
            { name: DoctorLevel.name, schema: DoctorLevelSchema }
        ]),
        forwardRef(() => AuthModule)
    ],
    providers: [UsersService ],
    controllers: [EmployeeController, DoctorController, PatientController],
    exports: [UsersService]
})
export class UsersModule {}
