import { Doctor } from '@modules/user-service/schemas/doctor.schema'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { isValidObjectId, Model, Types } from 'mongoose'
import { CreateSpecialityDto, UpdateSpecialityDto } from './dtos/speciality.dto'
import { Speciality, SpecialityDocument } from './schemas/speciality.schema'

@Injectable()
export class SpecialityService {
  constructor(
    @InjectModel(Speciality.name) private specialityModel: Model<SpecialityDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
  ) {}

  async getAllSpecialities(): Promise<Speciality[]> {
    return this.specialityModel.find().exec()
  }

  async getSpecialityById(id: string): Promise<Speciality> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid speciality ID')

    const speciality = await this.specialityModel.findById(id).exec()
    if (!speciality) throw new NotFoundException('Speciality not found')
    return speciality
  }

  async searchSpecialities(
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

    const total = await this.specialityModel.countDocuments(filter)
    const specialities = await this.specialityModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortField]: sortOrder })
      .sort({ createdAt: 'desc' })
    return { data: specialities, total, page, limit }
  }

  async createSpeciality(createSpecialityDto: CreateSpecialityDto): Promise<Speciality> {
    try {
      const existing = await this.specialityModel.findOne({ name: createSpecialityDto.name }).exec()
      if (existing) {
        throw new BadRequestException('Speciality name already exists')
      }
      const speciality = new this.specialityModel(createSpecialityDto)
      return await speciality.save()
    } catch (error: any) {
      console.error('Error creating speciality:', error.message)
      throw new InternalServerErrorException('Error creating speciality')
    }
  }

  async updateSpeciality(
    id: string,
    updateSpecialityDto: UpdateSpecialityDto,
  ): Promise<Speciality> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid speciality ID')

    const updated = await this.specialityModel
      .findByIdAndUpdate(id, updateSpecialityDto, { new: true })
      .exec()
    if (!updated) throw new NotFoundException('Speciality not found')
    return updated
  }

  async deleteSpeciality(id: string): Promise<void> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid speciality ID')

    const isBeingUsed = await this.doctorModel.exists({ specialty: new Types.ObjectId(id) }).exec()
    if (isBeingUsed) {
      throw new BadRequestException('Cannot delete speciality as it is assigned to doctors')
    }

    const result = await this.specialityModel.findByIdAndDelete(id).exec()
    if (!result) throw new NotFoundException('Speciality not found')
  }
}
