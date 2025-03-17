import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateSpecialityDto, UpdateSpecialityDto } from "./dtos/speciality.dto";
import { Speciality, SpecialityDocument } from "./schemas/speciality.schema";

@Injectable()
export class SpecialityService {
    constructor(@InjectModel(Speciality.name) private specialityModel: Model<SpecialityDocument>) {}

    async getAllSpecialities(): Promise<Speciality[]> {
        return await this.specialityModel.find().exec();
    }

    async getSpecialityById(id: string): Promise<Speciality> {
        const speciality = await this.specialityModel.findById(id).exec();
        if (!speciality) throw new NotFoundException("Speciality not found");
        return speciality;
    }

    async createSpeciality(createSpecialityDto: CreateSpecialityDto): Promise<Speciality> {
        try {
            const speciality = new this.specialityModel(createSpecialityDto);
            return await speciality.save();
        } catch (error) {
            throw new InternalServerErrorException("Error creating speciality");
        }
    }

    async updateSpeciality(id: string, updateSpecialityDto: UpdateSpecialityDto): Promise<Speciality> {
        const updatedSpeciality = await this.specialityModel.findByIdAndUpdate(id, updateSpecialityDto, { new: true }).exec();
        if (!updatedSpeciality) throw new NotFoundException("Speciality not found");
        return updatedSpeciality;
    }

    async deleteSpeciality(id: string): Promise<void> {
        const result = await this.specialityModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException("Speciality not found");
    }
}
