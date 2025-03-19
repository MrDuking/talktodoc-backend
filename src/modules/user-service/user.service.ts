import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import mongoose, { Model } from "mongoose"
import { CreateDoctorDto, CreateEmployeeDto, CreatePatientDto, UpdateDoctorDto, UpdateEmployeeDto, UpdatePatientDto } from "./dtos/index"
import { BaseUser, BaseUserDocument } from "./schemas/base-user.schema"
import { Doctor, DoctorDocument } from "./schemas/doctor.schema"
import { Employee, EmployeeDocument } from "./schemas/employee.schema"
import { Patient, PatientDocument } from "./schemas/patient.schema"
@Injectable()
export class UsersService {
    constructor(
        @InjectModel(BaseUser.name) private baseUserModel: Model<BaseUserDocument>,
        @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
        @InjectModel(Patient.name) private patientModel: Model<PatientDocument>
    ) {}
    async findByUsername(username: string): Promise<BaseUser | null> {
        try {
            return await this.baseUserModel.findOne({ username }).lean().exec()
        } catch (error: any) {
            console.error("Error finding user by username:", error.message)
            throw new InternalServerErrorException("Error finding user by username")
        }
    }

    // ===================== API CHO EMPLOYEE =====================
    async getAllEmployees(): Promise<Employee[]> {
        return this.employeeModel.find().exec()
    }

    async getEmployeeById(id: string): Promise<Employee> {
        const employee = await this.employeeModel.findOne({ id }).exec()
        if (!employee) throw new NotFoundException("Employee not found")
        return employee
    }

    async createEmployee(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        const employee = new this.employeeModel(createEmployeeDto)
        return employee.save()
    }

    async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        const updatedEmployee = await this.employeeModel.findOneAndUpdate({ _id: id }, updateEmployeeDto, { new: true }).exec()

        if (!updatedEmployee) throw new NotFoundException("Employee not found")
        return updatedEmployee
    }

    async deleteEmployee(id: string): Promise<void> {
        const result = await this.employeeModel.findOneAndDelete({ _id: id }).exec()
        if (!result) throw new NotFoundException("Employee not found")
    }

    // ===================== API CHO DOCTOR =====================
    async getAllDoctors(): Promise<Doctor[]> {
        return this.doctorModel
            .find()
            .populate({ path: "specialty", model: "Speciality", localField: "specialty", foreignField: "id" })
            .populate({ path: "rank", model: "DoctorLevel", localField: "rank", foreignField: "id" })
            .populate({ path: "hospitalId", model: "Hospital" }) // Populate thông tin bệnh viện
            .exec()
    }
    async searchDoctors(query: string, page: number = 1, limit: number = 10, sortField: string = "name", sortOrder: "asc" | "desc" = "asc") {
        const filter: any = {}

        if (query) {
            filter.$or = [
                { id: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } },
                { specialty: { $in: [new RegExp(query, "i")] } },
                { hospitalId: { $regex: query, $options: "i" } },
                { rank: { $regex: query, $options: "i" } },
                { fullName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { phoneNumber: { $regex: query, $options: "i" } }
            ]
        }

        const total = await this.doctorModel.countDocuments(filter)
        const doctors = await this.doctorModel
            .find(filter)
            // .populate({ path: "specialty", model: "Speciality" })
            // .populate({ path: "rank", model: "DoctorLevel" })
            // .populate({ path: "hospital", model: "Hospital" }) // Lấy đầy đủ object của bệnh viện
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder })
            .lean()
            .exec()

        return { data: doctors, total, page, limit }
    }
    async getDoctorById(id: string): Promise<Doctor> {
        const doctor = await this.doctorModel
            .findOne({ id })
            .populate({ path: "specialty", model: "Speciality", localField: "specialty", foreignField: "id" })
            .populate({ path: "rank", model: "DoctorLevel", localField: "rank", foreignField: "id" })
            .exec()

        if (!doctor) throw new NotFoundException("Doctor not found")
        return doctor
    }

    async createDoctor(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
        const doctor = new this.doctorModel(createDoctorDto)
        return doctor.save()
    }

    async updateDoctor(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid doctor ID format")
        }

        const updatedDoctor = await this.doctorModel
            .findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(id) }, // Convert id thành ObjectId
                updateDoctorDto,
                { new: true, runValidators: true }
            )
            .exec()

        if (!updatedDoctor) throw new NotFoundException("Doctor not found")

        console.log("Updated doctor:", updatedDoctor)

        // Populate đầy đủ thông tin
        const populatedDoctor = await this.doctorModel
            .findOne({ _id: new mongoose.Types.ObjectId(id) }) // Truy vấn đúng ObjectId
            .populate("specialty")
            .populate("rank")
            .populate("hospitalId") // Populate đầy đủ thông tin bệnh viện
            .exec()

        if (!populatedDoctor) throw new NotFoundException("Doctor not found")

        return populatedDoctor
    }

    async deleteDoctor(id: string): Promise<void> {
        const result = await this.doctorModel.findOneAndDelete({ _id: id }).exec()
        if (!result) throw new NotFoundException("Doctor not found")
    }

    // ===================== API CHO PATIENT =====================
    async getAllPatients(): Promise<Patient[]> {
        return this.patientModel.find().exec()
    }

    async getPatientById(id: string): Promise<Patient> {
        const patient = await this.patientModel.findOne({ id }).exec()
        if (!patient) throw new NotFoundException("Patient not found")
        return patient
    }

    async createPatient(createPatientDto: CreatePatientDto): Promise<Patient> {
        const patient = new this.patientModel(createPatientDto)
        return patient.save()
    }

    async updatePatient(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        const updatedPatient = await this.patientModel.findOneAndUpdate({ _id: id }, updatePatientDto, { new: true }).exec()

        if (!updatedPatient) throw new NotFoundException("Patient not found")
        return updatedPatient
    }

    async deletePatient(id: string): Promise<void> {
        const result = await this.patientModel.findOneAndDelete({ _id: id }).exec()
        if (!result) throw new NotFoundException("Patient not found")
    }

    // ===================== Search =====================

    async searchEmployees(query: string, page: number = 1, limit: number = 10, sortField: string = "name", sortOrder: "asc" | "desc" = "asc") {
        const filter: any = {}

        if (query) {
            filter.$or = [
                { id: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } },
                { position: { $regex: query, $options: "i" } },
                { department: { $regex: query, $options: "i" } },
                { fullName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { phoneNumber: { $regex: query, $options: "i" } }
            ]
        }

        console.log("MongoDB Query:", JSON.stringify(filter, null, 2))

        const total = await this.employeeModel.countDocuments(filter)
        const employees = await this.employeeModel
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder })
            .lean()
            .exec()

        return { data: employees, total, page, limit }
    }

    async searchPatients(query: string, page: number = 1, limit: number = 10, sortField: string = "name", sortOrder: "asc" | "desc" = "asc") {
        const filter: any = {}

        if (query) {
            filter.$or = [
                { id: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } },
                { fullName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { phoneNumber: { $regex: query, $options: "i" } }
            ]
        }

        console.log("MongoDB Query:", JSON.stringify(filter, null, 2))

        const total = await this.patientModel.countDocuments(filter)
        const patients = await this.patientModel
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder })
            .lean()
            .exec()

        return { data: patients, total, page, limit }
    }
}
