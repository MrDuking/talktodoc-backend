import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Hospital, HospitalDocument } from "./schemas/hopital.schema";
import { CreateHospitalDto, UpdateHospitalDto } from "./dtos/index";

@Injectable()
export class HospitalService {
    constructor(@InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>) {}

    async getAllHospitals(): Promise<Hospital[]> {
        return await this.hospitalModel.find().exec();
    }

    async getHospitalById(id: string): Promise<Hospital> {
        const hospital = await this.hospitalModel.findById(id).exec();
        if (!hospital) throw new NotFoundException("Hospital not found");
        return hospital;
    }

    async createHospital(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
        try {
            const hospital = new this.hospitalModel(createHospitalDto);
            return await hospital.save();
        } catch (error: any) {
            console.error("Error creating hospital:", error.message);
            if (error.code === 11000) throw new BadRequestException("Hospital name must be unique");
            throw new InternalServerErrorException("Error creating hospital");
        }
    }

    async updateHospital(id: string, updateHospitalDto: UpdateHospitalDto): Promise<Hospital> {
        const updatedHospital = await this.hospitalModel.findByIdAndUpdate(id, updateHospitalDto, { new: true }).exec();
        if (!updatedHospital) throw new NotFoundException("Hospital not found");
        return updatedHospital;
    }

    async deleteHospital(id: string): Promise<void> {
        const result = await this.hospitalModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException("Hospital not found");
    }
}
