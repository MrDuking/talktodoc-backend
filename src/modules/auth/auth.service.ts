import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectModel } from "@nestjs/mongoose"
import * as bcrypt from "bcrypt"
import { Model } from "mongoose"
import { Admin, AdminDocument } from "../user-service/schemas/admin.schema"
import { Doctor, DoctorDocument } from "../user-service/schemas/doctor.schema"
import { Employee, EmployeeDocument } from "../user-service/schemas/employee.schema"
import { Patient, PatientDocument } from "../user-service/schemas/patient.schema"
import { LoginDto } from "./dtos/login.dto"
import { RegisterUserDto } from "./dtos/register-user.dto"

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
        @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
        @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
        private readonly jwtService: JwtService
    ) {}

    async validateUser(identifier: string, password: string): Promise<any> {
        const user = await this.findUserByIdentifier(identifier)
        if (!user) throw new UnauthorizedException("User not found")

        // const isMatch = await bcrypt.compare(password, user.password)
        // if (!isMatch) throw new UnauthorizedException("Invalid password")
        if (user.password !== password) {
            throw new UnauthorizedException("Invalid password");
          }
        const { password: _, ...result } = user
        return result
    }

    async findUserByIdentifier(identifier: string): Promise<any> {
        const matchFields = {
            $or: [{ username: identifier }, { email: identifier }, { phoneNumber: identifier }]
        }

        const admin = await this.adminModel.findOne(matchFields).lean()
        if (admin) return { ...admin, role: "ADMIN" }

        const doctor = await this.doctorModel.findOne(matchFields).lean()
        if (doctor) return { ...doctor, role: "DOCTOR" }

        const employee = await this.employeeModel.findOne(matchFields).lean()
        if (employee) return { ...employee, role: "EMPLOYEE" }

        const patient = await this.patientModel.findOne(matchFields).lean()
        if (patient) return { ...patient, role: "PATIENT" }

        return null
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.identifier, loginDto.password)
        const payload = { username: user.username, sub: user._id, role: user.role }
        return {
            accessToken: this.jwtService.sign(payload),
            userProfile: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                phoneNumber: user.phoneNumber
            }
        }
    }

    async register(dto: RegisterUserDto): Promise<any> {
        const { username, email, phoneNumber, password } = dto
        const existing = await this.patientModel.findOne({
            $or: [{ username }, { email }, { phoneNumber }]
        })

        if (existing) {
            throw new UnauthorizedException("User already exists")
        }

        // const hashedPassword = await bcrypt.hash(password, 10) ma hoa
        const newUser = new this.patientModel({
            username,
            email,
            phoneNumber,
            password
            // password: hashedPassword
        })

        return newUser.save()
    }

    handleRoleBasedAction(user: any) {
        switch (user.role) {
            case "ADMIN":
                break
            case "DOCTOR":
                break
            case "EMPLOYEE":
                break
            case "PATIENT":
                break
            default:
                throw new UnauthorizedException("Invalid role")
        }
    }
}
