import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { UserServiceInterface } from "../shared/user-service.interface"
import { CreateDoctorDto, UpdateDoctorDto } from "./dtos/doctor.dto"
import { CreateUserDto, UpdateUserDto } from "./dtos/index"
import { CreatePatientDto, UpdatePatientDto } from "./dtos/patient.dto"
import { Doctor, DoctorDocument, Patient, PatientDocument, User, UserDocument } from "./schemas/index"

@Injectable()
export class UsersService implements UserServiceInterface {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>
    ) {}

    // --------- API cho User ---------
    async findAll(): Promise<User[]> {
        try {
            return await this.userModel.find().exec()
        } catch (error: any) {
            console.error("Error fetching users:", error.message)
            throw new InternalServerErrorException("Error fetching users")
        }
    }

    async findByUsername(username: string): Promise<User | null> {
        try {
            const user = await this.userModel.findOne({ username }).exec()
            if (!user) throw new NotFoundException("User not found")
            return user
        } catch (error: any) {
            console.error("Error finding user:", error.message)
            throw new InternalServerErrorException("Error finding user")
        }
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        try {
            const createdUser = new this.userModel(createUserDto)
            return await createdUser.save()
        } catch (error: any) {
            console.error("Error creating user:", error.message)
            if (error.code === 11000) {
                throw new BadRequestException("Username or Email already exists")
            }
            throw new InternalServerErrorException("Error creating user")
        }
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec()
            if (!updatedUser) {
                throw new NotFoundException("User not found to update")
            }
            return updatedUser
        } catch (error: any) {
            console.error("Error updating user:", error.message)
            throw new InternalServerErrorException("Error updating user")
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const result = await this.userModel.findByIdAndDelete(id).exec()
            if (!result) {
                throw new NotFoundException("User not found to delete")
            }
        } catch (error: any) {
            console.error("Error deleting user:", error.message)
            throw new InternalServerErrorException("Error deleting user")
        }
    }

    // --------- API cho Doctor ---------
    async getAllDoctors(): Promise<Doctor[]> {
        try {
            return await this.doctorModel.find().exec()
        } catch (error: any) {
            console.error("Error fetching doctors:", error.message)
            throw new InternalServerErrorException("Error fetching doctors")
        }
    }

    async getDoctorById(id: string): Promise<Doctor> {
        try {
            const doctor = await this.doctorModel.findById(id).exec()
            if (!doctor) throw new NotFoundException("Doctor not found")
            return doctor
        } catch (error: any) {
            console.error("Error finding doctor:", error.message)
            throw new InternalServerErrorException("Error finding doctor")
        }
    }

    async createDoctor(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
        try {
            const doctor = new this.doctorModel(createDoctorDto)
            return await doctor.save()
        } catch (error: any) {
            console.error("Error creating doctor:", error.message)
            if (error.code === 11000) throw new BadRequestException("Username or Email already exists")
            throw new InternalServerErrorException("Error creating doctor")
        }
    }

    async updateDoctor(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
        try {
            const updatedDoctor = await this.doctorModel.findByIdAndUpdate(id, updateDoctorDto, { new: true }).exec()
            if (!updatedDoctor) throw new NotFoundException("Doctor not found")
            return updatedDoctor
        } catch (error: any) {
            console.error("Error updating doctor:", error.message)
            throw new InternalServerErrorException("Error updating doctor")
        }
    }

    async deleteDoctor(id: string): Promise<void> {
        try {
            const result = await this.doctorModel.findByIdAndDelete(id).exec()
            if (!result) throw new NotFoundException("Doctor not found")
        } catch (error: any) {
            console.error("Error deleting doctor:", error.message)
            throw new InternalServerErrorException("Error deleting doctor")
        }
    }

    // --------- API cho Patient ---------
    async getAllPatients(): Promise<Patient[]> {
        try {
            return await this.patientModel.find().exec()
        } catch (error: any) {
            console.error("Error fetching patients:", error.message)
            throw new InternalServerErrorException("Error fetching patients")
        }
    }

    async getPatientById(id: string): Promise<Patient> {
        try {
            const patient = await this.patientModel.findById(id).exec()
            if (!patient) throw new NotFoundException("Patient not found")
            return patient
        } catch (error: any) {
            console.error("Error finding patient:", error.message)
            throw new InternalServerErrorException("Error finding patient")
        }
    }

    async createPatient(createPatientDto: CreatePatientDto): Promise<Patient> {
        try {
            const patient = new this.patientModel(createPatientDto)
            return await patient.save()
        } catch (error: any) {
            console.error("Error creating patient:", error.message)
            if (error.code === 11000) throw new BadRequestException("Username or Email already exists")
            throw new InternalServerErrorException("Error creating patient")
        }
    }

    async updatePatient(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        try {
            const updatedPatient = await this.patientModel.findByIdAndUpdate(id, updatePatientDto, { new: true }).exec()
            if (!updatedPatient) throw new NotFoundException("Patient not found")
            return updatedPatient
        } catch (error: any) {
            console.error("Error updating patient:", error.message)
            throw new InternalServerErrorException("Error updating patient")
        }
    }

    async deletePatient(id: string): Promise<void> {
        try {
            const result = await this.patientModel.findByIdAndDelete(id).exec()
            if (!result) throw new NotFoundException("Patient not found")
        } catch (error: any) {
            console.error("Error deleting patient:", error.message)
            throw new InternalServerErrorException("Error deleting patient")
        }
    }
}
