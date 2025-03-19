import { Doctor } from "@modules/user-service/schemas/doctor.schema"
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CreateSpecialityDto, UpdateSpecialityDto } from "./dtos/speciality.dto"
import { Speciality, SpecialityDocument } from "./schemas/speciality.schema"

@Injectable()
export class SpecialityService {
    constructor(
        @InjectModel(Speciality.name) private specialityModel: Model<SpecialityDocument>,
        @InjectModel(Doctor.name) private doctorModel: Model<Doctor>
    ) {}

    async getAllSpecialities(): Promise<Speciality[]> {
        return this.specialityModel.find().exec()
    }

    async getSpecialityById(id: string): Promise<Speciality> {
        const speciality = await this.specialityModel.findOne({ id }).exec()
        if (!speciality) throw new NotFoundException("Speciality not found")
        return speciality
    }

    async searchSpecialities(query: string, page: number = 1, limit: number = 10, sortField: string = "name", sortOrder: "asc" | "desc" = "asc") {
        const filter: any = {}

        if (query) {
            filter.$or = [
                { id: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { config: { $regex: query, $options: "i" } }
            ]
        }

        const total = await this.specialityModel.countDocuments(filter)
        const specialities = await this.specialityModel
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder })
            .lean()
            .exec()

        return { data: specialities, total, page, limit }
    }

    async createSpeciality(createSpecialityDto: CreateSpecialityDto): Promise<Speciality> {
        try {
            const existingSpeciality = await this.specialityModel.findOne({ name: createSpecialityDto.name }).exec()
            if (existingSpeciality) {
                throw new BadRequestException("Speciality name already exists")
            }
            const speciality = new this.specialityModel(createSpecialityDto)
            return await speciality.save()
        } catch (error: any) {
            console.error("Error creating speciality:", error.message)
            throw new InternalServerErrorException("Error creating speciality")
        }
    }

    async updateSpeciality(id: string, updateSpecialityDto: UpdateSpecialityDto): Promise<Speciality> {
        const speciality = await this.specialityModel.findOne({ id }).exec()
        if (!speciality) throw new NotFoundException("Speciality not found")

        const updatedSpeciality = await this.specialityModel.findOneAndUpdate({ _id:id }, updateSpecialityDto, { new: true }).exec()
        return updatedSpeciality!
    }

    async deleteSpeciality(id: string): Promise<void> {
        const doctorUsingSpeciality = await this.doctorModel.findOne({ specialty: id }).exec()
        if (doctorUsingSpeciality) {
            throw new BadRequestException("Cannot delete speciality as it is assigned to doctors")
        }

        const result = await this.specialityModel.findOneAndDelete({ id }).exec()
        if (!result) throw new NotFoundException("Speciality not found")
    }
}
