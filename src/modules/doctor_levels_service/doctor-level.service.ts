import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CreateDoctorLevelDto, UpdateDoctorLevelDto } from "./dtos/doctor-level.dto"
import { DoctorLevel, DoctorLevelDocument } from "./schemas/doctor-level.schema"

@Injectable()
export class DoctorLevelService {
    constructor(@InjectModel(DoctorLevel.name) private doctorLevelModel: Model<DoctorLevelDocument>) {}

    async getAllDoctorLevels(): Promise<DoctorLevel[]> {
        return this.doctorLevelModel.find().exec()
    }

    async getDoctorLevelById(id: string): Promise<DoctorLevel> {
        const level = await this.doctorLevelModel.findOne({ id }).exec()
        if (!level) throw new NotFoundException("Doctor level not found")
        return level
    }

    async createDoctorLevel(createDoctorLevelDto: CreateDoctorLevelDto): Promise<DoctorLevel> {
        try {
            const existingLevel = await this.doctorLevelModel.findOne({ name: createDoctorLevelDto.name }).exec()
            if (existingLevel) {
                throw new BadRequestException("Doctor level name already exists")
            }

            const newLevel = new this.doctorLevelModel(createDoctorLevelDto)
            return await newLevel.save()
        } catch (error: any) {
            throw new InternalServerErrorException("Error creating doctor level")
        }
    }

    async updateDoctorLevel(id: string, updateDoctorLevelDto: UpdateDoctorLevelDto): Promise<DoctorLevel> {
        const updatedLevel = await this.doctorLevelModel.findOneAndUpdate({ id }, updateDoctorLevelDto, { new: true }).exec()

        if (!updatedLevel) throw new NotFoundException("Doctor level not found")
        return updatedLevel
    }

    async deleteDoctorLevel(id: string): Promise<void> {
        const result = await this.doctorLevelModel.findOneAndDelete({ id }).exec()
        if (!result) throw new NotFoundException("Doctor level not found")
    }

    async searchDoctorLevels(
        query: string,
        page: number = 1,
        limit: number = 10,
        sortField: string = "name",
        sortOrder: "asc" | "desc" = "asc"
    ): Promise<{ data: DoctorLevel[]; total: number; page: number; limit: number }> {
        const filter: any = {};

        if (query) {
            filter.$or = [
                { id: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ];
        }

        console.log("MongoDB Query:", JSON.stringify(filter, null, 2));

        const total = await this.doctorLevelModel.countDocuments(filter);
        const levels = await this.doctorLevelModel
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder })
            .lean()
            .exec();

        return { data: levels, total, page, limit };
    }
}
