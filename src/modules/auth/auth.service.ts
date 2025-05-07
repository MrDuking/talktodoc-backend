import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { EmailOtp } from "../otp_service/schemas/email-otp.schema"
import { StringeeService } from "../stringee-service/stringee.service"
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
        @InjectModel(EmailOtp.name) private otpModel: Model<EmailOtp>,
        private readonly jwtService: JwtService,
        private readonly stringeeService: StringeeService
    ) {}

    async validateUser(identifier: string, password: string): Promise<any> {
        const user = await this.findUserByIdentifier(identifier)
        if (!user) throw new UnauthorizedException("Tài khoản không tồn tại, vui lòng kiểm tra lại.")

        // const isMatch = await bcrypt.compare(password, user.password)
        // if (!isMatch) throw new UnauthorizedException("Nhập sai mật khẩu, vui lòng kiểm tra lại.")
        if (user.password !== password) {
            throw new UnauthorizedException("Nhập sai mật khẩu, vui lòng kiểm tra lại.")
        }
        const { password: _, ...result } = user
        return result
    }

    async findUserByIdentifier(identifier: string): Promise<any> {
        const matchFields = {
            $or: [{ username: identifier }, { email: identifier }, { phoneNumber: identifier }]
        }

        // ADMIN không cần populate
        const admin = await this.adminModel.findOne(matchFields).lean()
        if (admin) return { ...admin, role: "ADMIN" }

        // Define common populate options
        const populateFields = [
            { path: "specialty", select: "name", options: { lean: true } },
            { path: "rank", select: "name", options: { lean: true } },
            { path: "hospital", select: "name", options: { lean: true } }
        ]

        const attachDefaults = (user: any, role: string) => ({
            ...user,
            specialty: user.specialty ?? { name: "Không xác định" },
            rank: user.rank ?? { name: "Không xác định" },
            hospital: user.hospital ?? { name: "Không xác định" },
            role
        })

        const doctor = await this.doctorModel.findOne(matchFields).populate(populateFields).lean().exec()
        if (doctor) return attachDefaults(doctor, "DOCTOR")

        const employee = await this.employeeModel.findOne(matchFields).populate(populateFields).lean().exec()
        if (employee) return attachDefaults(employee, "EMPLOYEE")

        const patient = await this.patientModel.findOne(matchFields).lean().exec()
        if (patient) return attachDefaults(patient, "PATIENT")

        return null
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.identifier, loginDto.password)
        const payload = { username: user.username, sub: user._id, role: user.role }
        console.log("payload", payload)
        console.log("user", user)
        const appAccessToken = this.jwtService.sign(payload) // Token login app
        const stringeeAccessToken = this.stringeeService.generateClientAccessToken(user._id.toString()) // Token login stringee
        return {
            accessToken: appAccessToken,
            stringeeAccessToken: stringeeAccessToken, // <-- Thêm vào response
            userProfile: user
        }
    }

    async register(dto: RegisterUserDto): Promise<any> {
        const { username, email, phoneNumber, password } = dto

        const existing = await this.patientModel.findOne({
            $or: [{ username }, { email }, { phoneNumber }]
        })
        if (existing) throw new UnauthorizedException("Tài khoản đã tồn tại, vui lòng kiểm tra lại.")

        // Kiểm tra OTP email đã được verify chưa
        const otpVerified = await this.otpModel.findOne({ email, isVerified: true })
        if (!otpVerified) {
            throw new UnauthorizedException("Email chưa được xác thực, vui lòng kiểm tra lại.")
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
