import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreatePharmacyDto, UpdatePharmacyDto } from "./dtos/pharmacy.dto";
import { Pharmacy, PharmacyDocument } from "./schemas/pharmacy.schema";

@Injectable()
export class PharmacyService {
    constructor(@InjectModel(Pharmacy.name) private pharmacyModel: Model<PharmacyDocument>) {}

    async getAllPharmacies(): Promise<Pharmacy[]> {
        try {
            return await this.pharmacyModel.find().exec();
        } catch (error: any) {
            throw new InternalServerErrorException("Error fetching pharmacies");
        }
    }

    async getPharmacyById(id: string): Promise<Pharmacy> {
        try {
            const pharmacy = await this.pharmacyModel.findById(id).exec();
            if (!pharmacy) throw new NotFoundException("Pharmacy not found");
            return pharmacy;
        } catch (error: any) {
            throw new InternalServerErrorException("Error finding pharmacy");
        }
    }

    async createPharmacy(createPharmacyDto: CreatePharmacyDto): Promise<Pharmacy> {
        try {
            const pharmacy = new this.pharmacyModel(createPharmacyDto);
            return await pharmacy.save();
        } catch (error: any) {
            if (error.code === 11000) throw new BadRequestException("Pharmacy name already exists");
            throw new InternalServerErrorException("Error creating pharmacy");
        }
    }

    async updatePharmacy(id: string, updatePharmacyDto: UpdatePharmacyDto): Promise<Pharmacy> {
        try {
            const updatedPharmacy = await this.pharmacyModel.findByIdAndUpdate(id, updatePharmacyDto, { new: true }).exec();
            if (!updatedPharmacy) throw new NotFoundException("Pharmacy not found");
            return updatedPharmacy;
        } catch (error: any) {
            throw new InternalServerErrorException("Error updating pharmacy");
        }
    }

    async deletePharmacy(id: string): Promise<void> {
        try {
            const result = await this.pharmacyModel.findByIdAndDelete(id).exec();
            if (!result) throw new NotFoundException("Pharmacy not found");
        } catch (error: any) {
            throw new InternalServerErrorException("Error deleting pharmacy");
        }
    }
}
