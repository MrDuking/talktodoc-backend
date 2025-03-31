import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import mongoose, { Model } from "mongoose"
import { CreateDoctorDto, CreateEmployeeDto, CreatePatientDto, UpdateDoctorDto, UpdateEmployeeDto, UpdatePatientDto } from "./dtos/index"
import { Doctor, DoctorDocument } from "./schemas/doctor.schema"
import { Employee, EmployeeDocument } from "./schemas/employee.schema"
import { Patient, PatientDocument } from "./schemas/patient.schema"

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
        @InjectModel(Patient.name) private patientModel: Model<PatientDocument>
    ) {} // ===================== API CHO EMPLOYEE =====================

    async getAllEmployees(): Promise<Employee[]> {
        return this.employeeModel.find().populate("specialty").exec()
    }

    async getEmployeeById(id: string): Promise<Employee> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid employee ID format")
        }

        const employee = await this.employeeModel.findById(id).populate("specialty").exec()

        if (!employee) throw new NotFoundException("Employee not found")
        return employee
    }

    async createEmployee(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        const employee = new this.employeeModel(createEmployeeDto)
        return employee.save()
    }

    async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        const updatedEmployee = await this.employeeModel.findByIdAndUpdate(id, updateEmployeeDto, { new: true }).exec()

        if (!updatedEmployee) throw new NotFoundException("Employee not found")
        return updatedEmployee
    }

    async deleteEmployee(id: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid employee ID format")
        const result = await this.employeeModel.findByIdAndDelete(id).exec()
        if (!result) throw new NotFoundException("Employee not found")
    } // ===================== API CHO DOCTOR =====================

    async getAllDoctors(): Promise<Doctor[]> {
        return this.doctorModel.find().populate("specialty").populate("rank").populate("hospital").exec()
    }

    async getDoctorById(id: string): Promise<Doctor> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid doctor ID format")
        }

        const doctor = await this.doctorModel.findById(id).populate("specialty").populate("rank").populate("hospital").exec()

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

        const updatedDoctor = await this.doctorModel.findByIdAndUpdate(id, updateDoctorDto, { new: true, runValidators: true }).exec()

        if (!updatedDoctor) throw new NotFoundException("Doctor not found")

        const populatedDoctor = await this.doctorModel.findById(updatedDoctor._id).populate("specialty").populate("rank").populate("hospital").exec()

        if (!populatedDoctor) throw new NotFoundException("Doctor not found")
        return populatedDoctor
    }

    async deleteDoctor(id: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid doctor ID format")
        const result = await this.doctorModel.findByIdAndDelete(id).exec()
        if (!result) throw new NotFoundException("Doctor not found")
    } // ===================== API CHO PATIENT =====================

    async getAllPatients(): Promise<Patient[]> {
        return this.patientModel.find().exec()
    }

    async getPatientById(id: string): Promise<Patient> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid patient ID format")
        const patient = await this.patientModel.findById(id).exec()
        if (!patient) throw new NotFoundException("Patient not found")
        return patient
    }

    async createPatient(createPatientDto: CreatePatientDto): Promise<Patient> {
        const patient = new this.patientModel(createPatientDto)
        return patient.save()
    }

    async updatePatient(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid patient ID format")
        const updatedPatient = await this.patientModel.findByIdAndUpdate(id, updatePatientDto, { new: true }).exec()
        if (!updatedPatient) throw new NotFoundException("Patient not found")
        return updatedPatient
    }

    async deletePatient(id: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid patient ID format")
        const result = await this.patientModel.findByIdAndDelete(id).exec()
        if (!result) throw new NotFoundException("Patient not found")
    } // ===================== Search =====================

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

        const total = await this.employeeModel.countDocuments(filter)
        const employees = await this.employeeModel
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
            .lean()
            .exec()

        return { data: employees, total, page, limit }
    }

    async searchDoctors(query: string, page: number = 1, limit: number = 10, sortField: string = "name", sortOrder: "asc" | "desc" = "asc") {
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

        const total = await this.doctorModel.countDocuments(filter)
        const doctors = await this.doctorModel
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
            .populate("rank")
            .populate("hospital")
            .populate("specialty")
            .lean()
            .exec()

        return { data: doctors, total, page, limit }
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

        const total = await this.patientModel.countDocuments(filter)
        const patients = await this.patientModel
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
            .lean()
            .exec()

        return { data: patients, total, page, limit }
    }
}
