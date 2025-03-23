import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Hospital, HospitalDocument } from "./schemas/hospital.schema";
import { CreateHospitalDto, UpdateHospitalDto } from "./dtos/index";

@Injectable()
export class HospitalService {
    constructor(
        @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>
    ) {}

    async getAllHospitals(): Promise<Hospital[]> {
        return this.hospitalModel
            .find()
            .populate("specialty")
            .exec();
    }

    async getHospitalById(id: string): Promise<Hospital> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid hospital ID format");
        }

        const hospital = await this.hospitalModel
            .findById(id)
            .populate("specialty")
            .exec();

        if (!hospital) throw new NotFoundException("Hospital not found");
        return hospital;
    }

    async searchHospitals(
        query: string,
        page: number = 1,
        limit: number = 10,
        sortField: string = "name",
        sortOrder: "asc" | "desc" = "asc"
    ) {
        const filter: any = {};

        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: "i" } },
                { address: { $regex: query, $options: "i" } },
                { phoneNumber: { $regex: query, $options: "i" } }
            ];
        }

        const total = await this.hospitalModel.countDocuments(filter);
        const hospitals = await this.hospitalModel
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder })
            .populate("specialty")
            .lean()
            .exec();

        return { data: hospitals, total, page, limit };
    }

    async createHospital(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
        try {
            const existing = await this.hospitalModel.findOne({ name: createHospitalDto.name }).exec();
            if (existing) {
                throw new BadRequestException("Hospital name already exists");
            }

            const hospital = new this.hospitalModel(createHospitalDto);
            return await hospital.save();
        } catch (error: any) {
            console.error("Error creating hospital:", error.message);
            if (error.code === 11000) throw new BadRequestException("Hospital name must be unique");
            throw new InternalServerErrorException("Error creating hospital");
        }
    }

    async updateHospital(id: string, updateHospitalDto: UpdateHospitalDto): Promise<Hospital> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid hospital ID format");
        }

        const updatedHospital = await this.hospitalModel
            .findByIdAndUpdate(id, updateHospitalDto, { new: true })
            .populate("specialty")
            .exec();

        if (!updatedHospital) throw new NotFoundException("Hospital not found");
        return updatedHospital;
    }

    async deleteHospital(id: string): Promise<void> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid hospital ID format");
        }

        const result = await this.hospitalModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException("Hospital not found");
    }
}
