import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CreatePharmacyDto, UpdatePharmacyDto } from "./dtos/pharmacy.dto"
import { Pharmacy, PharmacyDocument } from "./schemas/pharmacy.schema"

@Injectable()
export class PharmacyService {
    constructor(@InjectModel(Pharmacy.name) private pharmacyModel: Model<PharmacyDocument>) {}

    async getAllPharmacies(): Promise<Pharmacy[]> {
        return this.pharmacyModel.find().exec()
    }

    async getPharmacyById(id: string): Promise<Pharmacy> {
        const pharmacy = await this.pharmacyModel.findOne({ id }).exec()
        if (!pharmacy) throw new NotFoundException("Pharmacy not found")
        return pharmacy
    }

    async searchPharmacies(query: string, page: number = 1, limit: number = 10, sortField: string = "name", sortOrder: "asc" | "desc" = "asc") {
        const filter: any = {}

        if (query) {
            filter.$or = [
                { id: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } },
                { address: { $regex: query, $options: "i" } },
                { availableMedicines: { $in: [new RegExp(query, "i")] } }
            ]
        }

        const total = await this.pharmacyModel.countDocuments(filter)
        const pharmacies = await this.pharmacyModel
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder })
            .lean()
            .exec()

        return { data: pharmacies, total, page, limit }
    }

    async createPharmacy(createPharmacyDto: CreatePharmacyDto): Promise<Pharmacy> {
        try {
            const existingPharmacy = await this.pharmacyModel.findOne({ name: createPharmacyDto.name }).exec()
            if (existingPharmacy) {
                throw new BadRequestException("Pharmacy name already exists")
            }
            const pharmacy = new this.pharmacyModel(createPharmacyDto)
            return await pharmacy.save()
        } catch (error: any) {
            if (error.code === 11000) throw new BadRequestException("Pharmacy name must be unique")
            throw new InternalServerErrorException("Error creating pharmacy")
        }
    }

    async updatePharmacy(id: string, updatePharmacyDto: UpdatePharmacyDto): Promise<Pharmacy> {
        console.log("updatePharmacyDto", updatePharmacyDto)
        console.log("id", id)
        const updatedPharmacy = await this.pharmacyModel.findOneAndUpdate({ _id: id }, updatePharmacyDto, { new: true }).exec()
        if (!updatedPharmacy) throw new NotFoundException("Pharmacy not found")
        return updatedPharmacy
    }

    async deletePharmacy(id: string): Promise<void> {
        const result = await this.pharmacyModel.findOneAndDelete({ _id: id }).exec()
        if (!result) throw new NotFoundException("Pharmacy not found")
    }
}
