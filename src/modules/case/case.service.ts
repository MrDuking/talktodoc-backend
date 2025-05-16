import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface'
import { Medicine, MedicineDocument } from '@/modules/medicines_service/schemas/medicines.schema'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import moment from 'moment'
import { Model, Types } from 'mongoose'
import { AddOfferDto } from './dtos/add-offer.dto'
import { SubmitCaseDto } from './dtos/submit-case.dto'
import { Case, CaseDocument, CaseStatus } from './schemas/case.schema'
import { CaseAction } from './enum/case-action.enum'

interface PopulatedUser {
  fullName: string
}

function validateObjectIdOrThrow(id: string, label = 'ID') {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`${label} không hợp lệ`)
  }
}

@Injectable()
export class CaseService {
  constructor(
    @InjectModel(Case.name) private readonly caseModel: Model<CaseDocument>,
    @InjectModel(Medicine.name) private readonly medicineModel: Model<MedicineDocument>,
  ) {}

  async submitData(dto: SubmitCaseDto, user: JwtPayload) {
    const { case_id, appointment_id, medical_form, action } = dto
    validateObjectIdOrThrow(case_id, 'Bệnh án')

    const caseRecord = await this.caseModel.findById(case_id)
    if (!caseRecord) throw new NotFoundException('Không tìm thấy bệnh án')
    if (caseRecord.patient.toString() !== user.userId) {
      throw new BadRequestException('Bạn không có quyền cập nhật case này')
    }

    switch (action) {
      case CaseAction.SAVE:
        if (medical_form) caseRecord.medicalForm = medical_form
        await caseRecord.save()
        return { message: 'Đã lưu bệnh án tạm thời' }

      case CaseAction.SUBMIT:
        if (caseRecord.status === 'draft') {
          if (!appointment_id) throw new BadRequestException('Vui lòng chọn lịch hẹn trước')
          validateObjectIdOrThrow(appointment_id, 'Lịch hẹn')
          caseRecord.appointmentId = new Types.ObjectId(appointment_id)
          caseRecord.status = 'pending'
        } else if (caseRecord.status === 'assigned') {
          if (medical_form) caseRecord.medicalForm = medical_form
          caseRecord.status = 'completed'
        } else {
          throw new BadRequestException('Không thể submit ở trạng thái hiện tại')
        }
        await caseRecord.save()
        return { message: 'Cập nhật bệnh án thành công' }

      case CaseAction.SENDBACK:
        if (caseRecord.status !== 'assigned') {
          throw new BadRequestException('Chỉ trả lại case khi đang ở trạng thái assigned')
        }
        caseRecord.status = 'draft'
        await caseRecord.save()
        return { message: 'Đã trả bệnh án về trạng thái nháp' }

      default:
        throw new BadRequestException('Hành động không hợp lệ')
    }
  }

  async addOffer(caseId: string, doctorId: string, dto: AddOfferDto) {
    validateObjectIdOrThrow(caseId, 'Bệnh án')

    dto.medications.forEach(med => {
      validateObjectIdOrThrow(med.medicationId, 'ID thuốc')
    })

    const caseRecord = await this.caseModel.findById(caseId)
    if (!caseRecord) throw new NotFoundException('Không tìm thấy bệnh án')

    const medicines = await this.medicineModel.find({
      _id: { $in: dto.medications.map(m => m.medicationId) },
    })

    const mapped = dto.medications.map(m => {
      const found = medicines.find(med => (med._id as any).toString() === m.medicationId)
      if (!found) throw new BadRequestException(`Không tìm thấy thuốc với ID: ${m.medicationId}`)
      return {
        medicationId: found._id,
        name: found.name,
        dosage: m.dosage,
        usage: m.usage,
        duration: m.duration,
      }
    })

    await this.caseModel.findByIdAndUpdate(caseId, {
      $push: {
        offers: {
          createdAt: new Date(),
          createdBy: doctorId,
          note: dto.note || '',
          medications: mapped,
        },
      },
    })

    return { message: 'Đã thêm đơn thuốc thành công' }
  }

  async findOne(id: string, user: JwtPayload) {
    validateObjectIdOrThrow(id, 'Bệnh án')

    const record = await this.caseModel
      .findById(id)
      .populate('patient')
      .populate('specialty')
      .populate({
        path: 'appointmentId',
        populate: [{ path: 'doctor', populate: 'specialty' }, { path: 'patient' }],
      })
      .populate({
        path: 'offers.createdBy',
        select: 'fullName',
      })
      .lean()

    if (!record) throw new NotFoundException('Không tìm thấy bệnh án')
    if (record.patient._id.toString() !== user.userId && user.role !== 'DOCTOR') {
      throw new BadRequestException('Bạn không có quyền truy cập bệnh án này')
    }

    const offerSummary = (record.offers || []).map(offer => ({
      date: moment(offer.createdAt).format('DD/MM/YYYY'),
      doctor:
        typeof offer.createdBy === 'object'
          ? (offer.createdBy as unknown as PopulatedUser).fullName
          : 'Bác sĩ',
      summary: (offer.medications || [])
        .map(m => `${m.name} ${m.dosage} x ${m.duration}`)
        .join(', '),
    }))

    return { ...record, offerSummary }
  }

  async findAll(user: JwtPayload, page = 1, limit = 10, q?: string, status?: CaseStatus) {
    const filter: any = {
      patient: user.userId,
      isDeleted: false,
    }

    if (q) {
      filter.$or = [
        { 'medicalForm.symptoms': { $regex: q, $options: 'i' } },
        { 'medicalForm.note': { $regex: q, $options: 'i' } },
      ]
    }

    if (status) {
      filter.status = status
    }

    const total = await this.caseModel.countDocuments(filter)
    const data = await this.caseModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('specialty')
      .lean()

    return { total, page, limit, data }
  }

  async deleteCase(id: string, user: JwtPayload) {
    validateObjectIdOrThrow(id, 'Bệnh án')

    const caseRecord = await this.caseModel.findById(id)
    if (!caseRecord) throw new NotFoundException('Không tìm thấy bệnh án')
    if (caseRecord.patient.toString() !== user.userId) {
      throw new BadRequestException('Bạn không có quyền xoá case này')
    }

    caseRecord.isDeleted = true
    caseRecord.deletedAt = new Date()
    await caseRecord.save()

    return { message: 'Đã xoá bệnh án (ẩn khỏi danh sách)' }
  }
}
