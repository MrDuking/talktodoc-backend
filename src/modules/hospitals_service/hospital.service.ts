import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CreateHospitalDto, UpdateHospitalDto } from "./dtos/index"
import { Hospital, HospitalDocument } from "./schemas/hospital.schema"

@Injectable()
export class HospitalService {
    constructor(@InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>) {}

    async getAllHospitals(): Promise<Hospital[]> {
        return this.hospitalModel.find().populate({ path: "specialty", model: "Speciality", localField: "specialty", foreignField: "id" }).exec()
    }

    async getHospitalById(id: string): Promise<Hospital> {
        const hospital = await this.hospitalModel.findOne({ _id: id }).populate({ path: "specialty", model: "Speciality", localField: "specialty", foreignField: "id" }).exec()

        if (!hospital) throw new NotFoundException("Hospital not found")
        return hospital
    }

    async searchHospitals(query: string, page: number = 1, limit: number = 10, sortField: string = "name", sortOrder: "asc" | "desc" = "asc") {
        const filter: any = {}

        if (query) {
            filter.$or = [
                { id: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } },
                { address: { $regex: query, $options: "i" } },
                { specialities: { $in: [new RegExp(query, "i")] } }
            ]
        }

        const total = await this.hospitalModel.countDocuments(filter)
        const hospitals = await this.hospitalModel
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder })
            .lean()
            .exec()

        return { data: hospitals, total, page, limit }
    }

    async createHospital(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
        try {
            const existingHospital = await this.hospitalModel.findOne({ name: createHospitalDto.name }).exec()
            if (existingHospital) {
                throw new BadRequestException("Hospital name already exists")
            }
            const hospital = new this.hospitalModel(createHospitalDto)
            return await hospital.save()
        } catch (error: any) {
            console.error("Error creating hospital:", error.message)
            if (error.code === 11000) throw new BadRequestException("Hospital name must be unique")
            throw new InternalServerErrorException("Error creating hospital")
        }
    }

    async updateHospital(id: string, updateHospitalDto: UpdateHospitalDto): Promise<Hospital> {
        const updatedHospital = await this.hospitalModel.findOneAndUpdate({ _id: id }, updateHospitalDto, { new: true }).exec()
        if (!updatedHospital) throw new NotFoundException("Hospital not found")
        return updatedHospital
    }

    async deleteHospital(id: string): Promise<void> {
        const result = await this.hospitalModel.findOneAndDelete({ _id: id }).exec()
        if (!result) throw new NotFoundException("Hospital not found")
    }
}
