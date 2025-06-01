import { AppointmentService } from '@/modules/appointments_service/appointment.service'
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface'
import { Medicine, MedicineDocument } from '@/modules/medicines_service/schemas/medicines.schema'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import moment from 'moment'
import { Model, Types } from 'mongoose'
import { Appointment } from '../appointments_service/schemas/appointment.schema'
import { AddOfferDto } from './dtos/add-offer.dto'
import { SubmitCaseDto } from './dtos/submit-case.dto'
import { CaseAction } from './enum/case-action.enum'
import {
  Case,
  CaseDocument,
  CaseStatus,
  generateCaseId,
  MedicalFormType,
  validateObjectIdOrThrow,
} from './schemas/case.schema'

interface PopulatedUser {
  _id: Types.ObjectId
  fullName: string
}

interface CaseResponse {
  message: string
  data: CaseDocument | Record<string, unknown> | string
}

interface CaseListResponse {
  total: number
  page: number
  limit: number
  data: Record<string, unknown>[]
}

@Injectable()
export class CaseService {
  private readonly logger = new Logger(CaseService.name)

  constructor(
    @InjectModel(Case.name) private readonly caseModel: Model<CaseDocument>,
    @InjectModel(Medicine.name) private readonly medicineModel: Model<MedicineDocument>,
    private readonly appointmentService: AppointmentService,
  ) {}

  // Function để tạo caseId unique với retry logic
  private async generateUniqueCaseId(): Promise<string> {
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const newCaseId = generateCaseId()

      // Kiểm tra xem caseId đã tồn tại chưa
      const existingCase = await this.caseModel.findOne({ caseId: newCaseId }).lean()
      if (!existingCase) {
        return newCaseId
      }

      attempts++
      this.logger.warn(`CaseId ${newCaseId} đã tồn tại, thử lại lần ${attempts}`)
    }

    throw new BadRequestException('Không thể tạo caseId unique sau nhiều lần thử')
  }

  async submitData(dto: SubmitCaseDto, user: JwtPayload): Promise<CaseResponse> {
    const { case_id, appointment_id, medical_form, action, specialty } = dto
    this.logger.log(`Xử lý case với action ${action}`)

    // CREATE: Tạo mới case
    if ((!case_id || case_id === '') && action === CaseAction.CREATE) {
      if (!specialty) throw new BadRequestException('Chuyên khoa là bắt buộc')
      validateObjectIdOrThrow(specialty, 'Chuyên khoa')

      // Tạo caseId unique
      const uniqueCaseId = await this.generateUniqueCaseId()

      const newCase = new this.caseModel({
        caseId: uniqueCaseId,
        patient: user.userId,
        specialty,
        medicalForm: medical_form || {},
        status: 'draft',
        createdAt: new Date(),
        isDeleted: false,
      })
      await newCase.save()

      this.logger.log(`Đã tạo case mới với caseId ${uniqueCaseId} và ID ${newCase._id}`)
      return {
        message: 'Tạo bệnh án thành công',
        data: {
          case_id: newCase._id,
          ...newCase.toObject(),
        },
      }
    }

    // Validate case_id và lấy thông tin case
    validateObjectIdOrThrow(case_id || '', 'Bệnh án')
    const caseRecord = await this.caseModel.findById(case_id)
    if (!caseRecord) throw new NotFoundException('Không tìm thấy bệnh án')
    // if (caseRecord.patient.toString() !== user.userId) {
    //   throw new BadRequestException('Bạn không có quyền cập nhật case này')
    // }
    // if (caseRecord.doctor.toString() !== user.userId) {
    //   throw new BadRequestException('Bạn không có quyền cập nhật case này')
    // }
    // Xử lý các action
    switch (action) {
      case CaseAction.SAVE:
        return await this.handleSaveAction(caseRecord, medical_form)

      case CaseAction.SUBMIT:
        return await this.handleSubmitAction(caseRecord, appointment_id, medical_form)

      case CaseAction.SENDBACK:
        return await this.handleSendbackAction(caseRecord)

      default:
        throw new BadRequestException('Hành động không hợp lệ')
    }
  }

  private async handleSaveAction(
    caseRecord: CaseDocument,
    medical_form?: MedicalFormType,
  ): Promise<CaseResponse> {
    if (caseRecord.status !== 'draft') {
      throw new BadRequestException('Chỉ có thể lưu tạm khi ở trạng thái nháp')
    }

    this.logger.log(`[DEBUG] Case status before save: ${caseRecord.status}`)
    this.logger.log(`[DEBUG] Current medicalForm: ${JSON.stringify(caseRecord.medicalForm)}`)
    this.logger.log(`[DEBUG] New medicalForm: ${JSON.stringify(medical_form)}`)

    if (medical_form) {
      caseRecord.medicalForm = medical_form
      this.logger.log(`[DEBUG] Updated medicalForm: ${JSON.stringify(caseRecord.medicalForm)}`)
    }

    const savedCase = await caseRecord.save()
    this.logger.log(`[DEBUG] Saved case medicalForm: ${JSON.stringify(savedCase.medicalForm)}`)

    this.logger.log(`Đã lưu tạm case ${caseRecord._id}`)
    return {
      message: 'Đã lưu bệnh án tạm thời',
      data: {
        case_id: caseRecord._id,
        caseId: caseRecord.caseId,
        medicalForm: savedCase.medicalForm,
        ...savedCase.toObject(),
      },
    }
  }

  private async handleSubmitAction(
    caseRecord: CaseDocument,
    appointment_id?: string,
    medical_form?: MedicalFormType,
  ): Promise<CaseResponse> {
    switch (caseRecord.status) {
      case 'draft':
        if (!appointment_id) {
          throw new BadRequestException('Vui lòng chọn lịch hẹn trước')
        }
        validateObjectIdOrThrow(appointment_id, 'Lịch hẹn')

        // Kiểm tra và liên kết với appointment
        const appointment = await this.appointmentService.findOne(appointment_id)
        if (!appointment) {
          throw new NotFoundException('Không tìm thấy lịch hẹn')
        }

        caseRecord.appointmentId = new Types.ObjectId(appointment_id)
        caseRecord.status = 'pending'
        this.logger.log(`Case ${caseRecord.caseId} chuyển sang trạng thái pending`)
        break

      case 'pending':
        // Kiểm tra trạng thái của appointment
        if (!caseRecord.appointmentId) {
          throw new BadRequestException('Case chưa được liên kết với appointment')
        }

        const pendingAppointment = await this.appointmentService.findOne(
          caseRecord.appointmentId.toString(),
        )
        if (!pendingAppointment) {
          throw new NotFoundException('Không tìm thấy lịch hẹn liên kết')
        }

        if (pendingAppointment.status !== 'CONFIRMED') {
          throw new BadRequestException('Lịch hẹn chưa được bác sĩ xác nhận')
        }

        if (medical_form) caseRecord.medicalForm = medical_form
        caseRecord.status = 'assigned'
        this.logger.log(`Case ${caseRecord.caseId} chuyển sang trạng thái assigned`)
        break

      case 'assigned':
        // Kiểm tra trạng thái appointment
        // if (caseRecord?.appointmentId) {
        //   const appointment = await this.appointmentService.findOne(
        //     caseRecord.appointmentId.toString(),
        //   )
        //   if (appointment.status !== 'COMPLETED') {
        //     throw new BadRequestException('Lịch hẹn chưa được hoàn tất')
        //   }
        // }

        if (medical_form) caseRecord.medicalForm = medical_form
        caseRecord.status = 'completed'
        this.logger.log(`Case ${caseRecord.caseId} chuyển sang trạng thái completed`)
        break

      default:
        throw new BadRequestException('Không thể submit ở trạng thái hiện tại')
    }

    await caseRecord.save()
    return {
      message: 'Cập nhật bệnh án thành công',
      data: {
        case_id: caseRecord._id,
        caseId: caseRecord.caseId,
        ...caseRecord.toObject(),
      },
    }
  }

  private async handleSendbackAction(caseRecord: CaseDocument): Promise<CaseResponse> {
    if (caseRecord.status !== 'assigned') {
      throw new BadRequestException('Chỉ trả lại case khi đang ở trạng thái assigned')
    }

    caseRecord.status = 'draft'
    await caseRecord.save()

    this.logger.log(`Case ${caseRecord.caseId} đã được trả về trạng thái draft`)
    return {
      message: 'Đã trả bệnh án về trạng thái nháp',
      data: {
        case_id: caseRecord._id,
        caseId: caseRecord.caseId,
        ...caseRecord.toObject(),
      },
    }
  }

  async updateCaseStatusByAppointment(
    appointmentId: string,
    appointmentStatus: string,
  ): Promise<void> {
    const caseRecord = await this.caseModel.findOne({
      appointmentId: new Types.ObjectId(appointmentId),
    })
    if (!caseRecord) {
      this.logger.warn(`Không tìm thấy case cho appointment ${appointmentId}`)
      return
    }

    switch (appointmentStatus) {
      case 'CONFIRMED':
        if (caseRecord.status === 'pending') {
          caseRecord.status = 'assigned'
          this.logger.log(
            `Case ${caseRecord.caseId} tự động chuyển sang assigned do appointment được xác nhận`,
          )
        }
        break

      case 'COMPLETED':
        if (caseRecord.status === 'assigned') {
          this.logger.log(
            `Appointment ${appointmentId} đã hoàn thành, case ${caseRecord.caseId} có thể chuyển sang completed`,
          )
        }
        break
    }

    await caseRecord.save()
  }

  async addOffer(caseId: string, doctorId: string, dto: AddOfferDto): Promise<CaseResponse> {
    validateObjectIdOrThrow(caseId, 'Bệnh án')
    // Map lại medications: chỉ lấy các field FE gửi lên, không cần kiểm tra tồn tại trong bảng medicine
    const medications = (dto.medications || []).map(med => ({
      medicationId: med.medicationId,
      name: med.name || 'Không tên thuốc',
      dosage: med.dosage,
      usage: med.usage,
      duration: med.duration,
      price: med.price,
      quantity: med.quantity,
    }))

    const caseRecord = await this.caseModel.findById(caseId)
    if (!caseRecord) throw new NotFoundException('Không tìm thấy bệnh án')

    await this.caseModel.findByIdAndUpdate(caseId, {
      $push: {
        offers: {
          createdAt: new Date(),
          createdBy: doctorId,
          note: dto.note || '',
          pharmacyId: dto.pharmacyId || '',
          shippingAddress: dto.shippingAddress || '',
          shippingPhone: dto.shippingPhone || '',
          medications,
        },
      },
    })

    return { message: 'Đã thêm đơn thuốc thành công', data: caseId }
  }

  async findOne(id: string, user: JwtPayload): Promise<CaseResponse> {
    validateObjectIdOrThrow(id, 'Bệnh án')

    const record = await this.caseModel
      .findById(id)
      .populate({
        path: 'appointmentId',
        populate: [
          {
            path: 'doctor',
          },
          {
            path: 'patient',
          },
        ],
      })
      .populate({ path: 'specialty' })
      .populate({ path: 'offers.pharmacyId' })
      .lean()

    if (!record) throw new NotFoundException('Không tìm thấy bệnh án')

    // Kiểm tra quyền truy cập
    if (user.role === 'PATIENT') {
      if (record.patient.toString() !== user.userId) {
        throw new BadRequestException('Bạn không có quyền truy cập bệnh án này')
      }
    } else if (user.role === 'DOCTOR') {
      const appointment = record.appointmentId as unknown as Appointment
      if (!appointment || appointment.doctor._id.toString() !== user.userId) {
        throw new BadRequestException('Bạn không phải là bác sĩ được gán cho bệnh án này')
      }
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

    return {
      data: { ...record, offerSummary },
      message: 'Lấy thông tin bệnh án thành công',
    }
  }

  async findAll(
    user: JwtPayload,
    page = 1,
    limit = 10,
    q?: string,
    status?: CaseStatus,
  ): Promise<CaseListResponse> {
    const filter: Record<string, unknown> = {
      isDeleted: false,
    }

    if (q) {
      filter.$or = [
        { 'medicalForm.symptoms': { $regex: q, $options: 'i' } },
        { 'medicalForm.note': { $regex: q, $options: 'i' } },
        { caseId: { $regex: q, $options: 'i' } }, // Thêm tìm kiếm theo caseId
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
      .populate({
        path: 'appointmentId',
        populate: [
          {
            path: 'doctor',
          },
          {
            path: 'patient',
          },
        ],
      })
      .populate({ path: 'specialty' })
      .lean()

    this.logger.log(`Tìm thấy ${data.length} case`)
    // Đảm bảo mỗi case chỉ trả về patient là id (string)
    const mappedData = (data || []).map(item => ({
      ...item,
      patient:
        typeof item.patient === 'object' && item.patient?._id
          ? item.patient._id.toString()
          : item.patient?.toString?.() || item.patient,
    }))
    return { total, page, limit, data: mappedData }
  }

  async getAllCase(
    page = 1,
    limit = 10,
    q?: string,
    status?: CaseStatus,
  ): Promise<CaseListResponse> {
    const filter: Record<string, unknown> = {
      isDeleted: false,
    }

    if (q) {
      filter.$or = [
        { 'medicalForm.symptoms': { $regex: q, $options: 'i' } },
        { 'medicalForm.note': { $regex: q, $options: 'i' } },
        { caseId: { $regex: q, $options: 'i' } }, // Thêm tìm kiếm theo caseId
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
      .populate({ path: 'specialty', select: 'name' })
      .lean()

    return { total, page, limit, data }
  }

  async deleteCase(id: string): Promise<CaseResponse> {
    validateObjectIdOrThrow(id, 'Bệnh án')

    const caseRecord = await this.caseModel.findById(id)
    if (!caseRecord) throw new NotFoundException('Không tìm thấy bệnh án')

    caseRecord.isDeleted = true
    caseRecord.deletedAt = new Date()
    await caseRecord.save()

    return { data: id, message: 'Đã xoá bệnh án (ẩn khỏi danh sách)' }
  }
}
