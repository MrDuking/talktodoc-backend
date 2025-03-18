import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
    CreateDoctorDto,
    CreateEmployeeDto,
    CreatePatientDto,
    UpdateDoctorDto,
    UpdateEmployeeDto,
    UpdatePatientDto
} from "./dtos/index";
import { BaseUser, BaseUserDocument } from "./schemas/base-user.schema";
import { Doctor, DoctorDocument } from "./schemas/doctor.schema";
import { Employee, EmployeeDocument } from "./schemas/employee.schema";
import { Patient, PatientDocument } from "./schemas/patient.schema";

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
            return await this.baseUserModel.findOne({ username }).lean().exec();
        } catch (error: any) {
            console.error("Error finding user by username:", error.message);
            throw new InternalServerErrorException("Error finding user by username");
        }
    }

    // ===================== API CHO EMPLOYEE =====================
    async getAllEmployees(): Promise<Employee[]> {
        return this.employeeModel.find().exec();
    }

    async getEmployeeById(id: string): Promise<Employee> {
        const employee = await this.employeeModel.findOne({ id }).exec();
        if (!employee) throw new NotFoundException("Employee not found");
        return employee;
    }

    async createEmployee(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        const employee = new this.employeeModel(createEmployeeDto);
        return employee.save();
    }

    async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        const updatedEmployee = await this.employeeModel
            .findOneAndUpdate({ id }, updateEmployeeDto, { new: true })
            .exec();
        if (!updatedEmployee) throw new NotFoundException("Employee not found");
        return updatedEmployee;
    }

    async deleteEmployee(id: string): Promise<void> {
        const result = await this.employeeModel.findOneAndDelete({ id }).exec();
        if (!result) throw new NotFoundException("Employee not found");
    }

    // ===================== API CHO DOCTOR =====================
    async getAllDoctors(): Promise<Doctor[]> {
        return this.doctorModel.find().populate("specialty").exec();
    }

    async getDoctorById(id: string): Promise<Doctor> {
        const doctor = await this.doctorModel.findOne({ id }).populate("specialty").exec();
        if (!doctor) throw new NotFoundException("Doctor not found");
        return doctor;
    }

    async createDoctor(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
        const doctor = new this.doctorModel(createDoctorDto);
        return doctor.save();
    }

    async updateDoctor(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
        const updatedDoctor = await this.doctorModel
            .findOneAndUpdate({ id }, updateDoctorDto, { new: true })
            .populate("specialty")
            .exec();
        if (!updatedDoctor) throw new NotFoundException("Doctor not found");
        return updatedDoctor;
    }

    async deleteDoctor(id: string): Promise<void> {
        const result = await this.doctorModel.findOneAndDelete({ id }).exec();
        if (!result) throw new NotFoundException("Doctor not found");
    }

    // ===================== API CHO PATIENT =====================
    async getAllPatients(): Promise<Patient[]> {
        return this.patientModel.find().exec();
    }

    async getPatientById(id: string): Promise<Patient> {
        const patient = await this.patientModel.findOne({ id }).exec();
        if (!patient) throw new NotFoundException("Patient not found");
        return patient;
    }

    async createPatient(createPatientDto: CreatePatientDto): Promise<Patient> {
        const patient = new this.patientModel(createPatientDto);
        return patient.save();
    }

    async updatePatient(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        const updatedPatient = await this.patientModel
            .findOneAndUpdate({ id }, updatePatientDto, { new: true })
            .exec();
        if (!updatedPatient) throw new NotFoundException("Patient not found");
        return updatedPatient;
    }

    async deletePatient(id: string): Promise<void> {
        const result = await this.patientModel.findOneAndDelete({ id }).exec();
        if (!result) throw new NotFoundException("Patient not found");
    }
}
