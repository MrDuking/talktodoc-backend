import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { EmployeeController } from "./employee.controller";
import { DoctorController } from "./doctor.controller";
import { PatientController } from "./patient.controller";
import { SpecialityController } from "./speciality.controller";
import { BaseUser, BaseUserSchema, Doctor, DoctorSchema, Employee, EmployeeSchema, Patient, PatientSchema, Speciality, SpecialitySchema } from "./schemas/index";
import { UsersService } from "./user.service";
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: BaseUser.name, schema: BaseUserSchema },
            { name: Doctor.name, schema: DoctorSchema },
            { name: Employee.name, schema: EmployeeSchema },
            { name: Patient.name, schema: PatientSchema },
            { name: Speciality.name, schema: SpecialitySchema }
        ]),
        forwardRef(() => AuthModule)
    ],
    providers: [UsersService ],
    controllers: [EmployeeController, DoctorController, PatientController, SpecialityController],
    exports: [UsersService]
})
export class UsersModule {}
