import { Doctor } from '@modules/user-service/schemas/doctor.schema'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { isValidObjectId, Model, Types } from 'mongoose'
import { CreateSpecialtyDto, UpdateSpecialtyDto } from './dtos/specialty.dto'
import { Specialty, SpecialtyDocument } from './schemas/specialty.schema'

@Injectable()
export class SpecialtyService {
  constructor(
    @InjectModel(Specialty.name) private specialtyModel: Model<SpecialtyDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
  ) {}

  async getAllSpecialties(): Promise<Specialty[]> {
    return this.specialtyModel.find().exec()
  }

  async getSpecialtyById(id: string): Promise<Specialty> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid specialty ID')

    const specialty = await this.specialtyModel.findById(id).exec()
    if (!specialty) throw new NotFoundException('Specialty not found')
    return specialty
  }

  async searchSpecialties(
    query: string,
    page: number = 1,
    limit: number = 10,
    sortField: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const filter: any = {}

    if (query) {
      filter.$or = [
        { id: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ]
    }

    const total = await this.specialtyModel.countDocuments(filter)
    const Specialties = await this.specialtyModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortField]: sortOrder })
      .sort({ createdAt: 'desc' })
    return { data: Specialties, total, page, limit }
  }

  async createSpecialty(createSpecialtyDto: CreateSpecialtyDto): Promise<Specialty> {
    try {
      const existing = await this.specialtyModel.findOne({ name: createSpecialtyDto.name }).exec()
      if (existing) {
        throw new BadRequestException('Specialty name already exists')
      }
      const specialty = new this.specialtyModel(createSpecialtyDto)
      return await specialty.save()
    } catch (error: any) {
      console.error('Error creating specialty:', error.message)
      throw new InternalServerErrorException('Error creating specialty')
    }
  }

  async updateSpecialty(id: string, updateSpecialtyDto: UpdateSpecialtyDto): Promise<Specialty> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid specialty ID')

    const updated = await this.specialtyModel
      .findByIdAndUpdate(id, updateSpecialtyDto, { new: true })
      .exec()
    if (!updated) throw new NotFoundException('Specialty not found')
    return updated
  }

  async deleteSpecialty(id: string): Promise<void> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid specialty ID')

    const isBeingUsed = await this.doctorModel.exists({ specialty: new Types.ObjectId(id) }).exec()
    if (isBeingUsed) {
      throw new BadRequestException('Cannot delete specialty as it is assigned to doctors')
    }

    const result = await this.specialtyModel.findByIdAndDelete(id).exec()
    if (!result) throw new NotFoundException('Specialty not found')
  }
}
