import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CreateDoctorDto, CreateEmployeeDto, CreatePatientDto, CreateSpecialityDto, UpdateDoctorDto, UpdateEmployeeDto, UpdatePatientDto, UpdateSpecialityDto } from "./dtos/index"
import { BaseUser, BaseUserDocument } from "./schemas/base-user.schema"
import { Doctor, DoctorDocument } from "./schemas/doctor.schema"
import { Employee, EmployeeDocument } from "./schemas/employee.schema"
import { Patient, PatientDocument } from "./schemas/patient.schema"
import { Speciality, SpecialityDocument } from "./schemas/speciality.schema"

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(BaseUser.name) private baseUserModel: Model<BaseUserDocument>,
        @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
        @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
        @InjectModel(Speciality.name) private specialityModel: Model<SpecialityDocument>
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
        return await this.employeeModel.find().exec()
    }

    async getEmployeeById(id: string): Promise<Employee> {
        const employee = await this.employeeModel.findById(id).exec()
        if (!employee) throw new NotFoundException("Employee not found")
        return employee
    }

    async createEmployee(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        const employee = new this.employeeModel(createEmployeeDto)
        return await employee.save()
    }

    async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        const updatedEmployee = await this.employeeModel.findByIdAndUpdate(id, updateEmployeeDto, { new: true }).exec()
        if (!updatedEmployee) throw new NotFoundException("Employee not found")
        return updatedEmployee
    }

    async deleteEmployee(id: string): Promise<void> {
        const result = await this.employeeModel.findByIdAndDelete(id).exec()
        if (!result) throw new NotFoundException("Employee not found")
    }

    // ===================== API CHO DOCTOR =====================
    async getAllDoctors(): Promise<Doctor[]> {
        return await this.doctorModel.find().exec()
    }

    async getDoctorById(id: string): Promise<Doctor> {
        const doctor = await this.doctorModel.findById(id).exec()
        if (!doctor) throw new NotFoundException("Doctor not found")
        return doctor
    }

    async createDoctor(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
        const doctor = new this.doctorModel(createDoctorDto)
        return await doctor.save()
    }

    async updateDoctor(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
        const updatedDoctor = await this.doctorModel.findByIdAndUpdate(id, updateDoctorDto, { new: true }).exec()
        if (!updatedDoctor) throw new NotFoundException("Doctor not found")
        return updatedDoctor
    }

    async deleteDoctor(id: string): Promise<void> {
        const result = await this.doctorModel.findByIdAndDelete(id).exec()
        if (!result) throw new NotFoundException("Doctor not found")
    }

    // ===================== API CHO PATIENT =====================
    async getAllPatients(): Promise<Patient[]> {
        return await this.patientModel.find().exec()
    }

    async getPatientById(id: string): Promise<Patient> {
        const patient = await this.patientModel.findById(id).exec()
        if (!patient) throw new NotFoundException("Patient not found")
        return patient
    }

    async createPatient(createPatientDto: CreatePatientDto): Promise<Patient> {
        const patient = new this.patientModel(createPatientDto)
        return await patient.save()
    }

    async updatePatient(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        const updatedPatient = await this.patientModel.findByIdAndUpdate(id, updatePatientDto, { new: true }).exec()
        if (!updatedPatient) throw new NotFoundException("Patient not found")
        return updatedPatient
    }

    async deletePatient(id: string): Promise<void> {
        const result = await this.patientModel.findByIdAndDelete(id).exec()
        if (!result) throw new NotFoundException("Patient not found")
    }

    // ===================== API CHO CHUYÊN KHOA (SPECIALITY) =====================
    async getAllSpecialities(): Promise<Speciality[]> {
        return await this.specialityModel.find().exec()
    }

    async getSpecialityById(id: string): Promise<Speciality> {
        const speciality = await this.specialityModel.findById(id).exec()
        if (!speciality) throw new NotFoundException("Speciality not found")
        return speciality
    }

    async createSpeciality(createSpecialityDto: CreateSpecialityDto): Promise<Speciality> {
        const speciality = new this.specialityModel(createSpecialityDto)
        return await speciality.save()
    }

    async updateSpeciality(id: string, updateSpecialityDto: UpdateSpecialityDto): Promise<Speciality> {
        const updatedSpeciality = await this.specialityModel.findByIdAndUpdate(id, updateSpecialityDto, { new: true }).exec()
        if (!updatedSpeciality) throw new NotFoundException("Speciality not found")
        return updatedSpeciality
    }

    async deleteSpeciality(id: string): Promise<void> {
        const result = await this.specialityModel.findByIdAndDelete(id).exec()
        if (!result) throw new NotFoundException("Speciality not found")
    }
}
