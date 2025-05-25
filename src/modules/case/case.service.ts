import { AppointmentService } from '@/modules/appointments_service/appointment.service'
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface'
import { Medicine, MedicineDocument } from '@/modules/medicines_service/schemas/medicines.schema'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import moment from 'moment'
import { Model, Types } from 'mongoose'
import { AddOfferDto } from './dtos/add-offer.dto'
import { SubmitCaseDto } from './dtos/submit-case.dto'
import { CaseAction } from './enum/case-action.enum'
import { Case, CaseDocument, CaseStatus } from './schemas/case.schema'

interface PopulatedUser {
  fullName: string
}

interface CreateCaseDto {
  specialtyId: string
  patient: string
}

function validateObjectIdOrThrow(id: string, label = 'ID') {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`${label} không hợp lệ`)
  }
}

@Injectable()
export class CaseService {
  private readonly logger = new Logger(CaseService.name)

  constructor(
    @InjectModel(Case.name) private readonly caseModel: Model<CaseDocument>,
    @InjectModel(Medicine.name) private readonly medicineModel: Model<MedicineDocument>,
    private readonly appointmentService: AppointmentService,
  ) {}

  async submitData(dto: SubmitCaseDto, user: JwtPayload) {
    console.log('dto', dto)
    const { case_id, appointment_id, medical_form, action, specialty } = dto as any
    this.logger.log(`Xử lý case với action ${action}`)

    // CREATE: Tạo mới case
    if ((!case_id || case_id === '') && action === CaseAction.CREATE) {
      if (!specialty) throw new BadRequestException('Chuyên khoa là bắt buộc')
      validateObjectIdOrThrow(specialty, 'Chuyên khoa')
      console.log('specialty', specialty)
      const newCase = new this.caseModel({
        patient: user.userId,
        specialty,
        medicalForm: medical_form || {},
        status: 'draft',
        createdAt: new Date(),
        isDeleted: false,
      })
      await newCase.save()

      this.logger.log(`Đã tạo case mới với ID ${newCase._id}`)
      return {
        message: 'Tạo bệnh án thành công',
        data: {
          case_id: newCase._id,
          ...newCase.toObject(),
        },
      }
    }
    console.log('case_id', case_id)
    // Validate case_id và lấy thông tin case
    validateObjectIdOrThrow(case_id, 'Bệnh án')
    const caseRecord = await this.caseModel.findById(case_id)
    if (!caseRecord) throw new NotFoundException('Không tìm thấy bệnh án')
    if (caseRecord.patient.toString() !== user.userId) {
      throw new BadRequestException('Bạn không có quyền cập nhật case này')
    }

    // Xử lý các action
    switch (action) {
      case CaseAction.SAVE:
        return await this.handleSaveAction(caseRecord, medical_form)

      case CaseAction.SUBMIT:
        console.log('appointment_id', appointment_id)
        return await this.handleSubmitAction(caseRecord, appointment_id, medical_form)

      case CaseAction.SENDBACK:
        return await this.handleSendbackAction(caseRecord)

      default:
        throw new BadRequestException('Hành động không hợp lệ')
    }
  }

  private async handleSaveAction(caseRecord: CaseDocument, medical_form?: any) {
    if (caseRecord.status !== 'draft') {
      throw new BadRequestException('Chỉ có thể lưu tạm khi ở trạng thái nháp')
    }

    if (medical_form) caseRecord.medicalForm = medical_form
    await caseRecord.save()

    this.logger.log(`Đã lưu tạm case ${caseRecord._id}`)
    return {
      message: 'Đã lưu bệnh án tạm thời',
      data: {
        case_id: caseRecord._id,
        ...caseRecord.toObject(),
      },
    }
  }

  private async handleSubmitAction(
    caseRecord: CaseDocument,
    appointment_id?: string,
    medical_form?: any,
  ) {
    console.log('caseRecord.status', caseRecord.status)
    switch (caseRecord.status) {
      case 'draft':
        if (!appointment_id) {
          throw new BadRequestException('Vui lòng chọn lịch hẹn trước')
        }
        console.log('appointment_id', appointment_id)
        validateObjectIdOrThrow(appointment_id, 'Lịch hẹn')

        // Kiểm tra và liên kết với appointment
        const appointment = await this.appointmentService.findOne(appointment_id)
        if (!appointment) {
          throw new NotFoundException('Không tìm thấy lịch hẹn')
        }

        caseRecord.appointmentId = new Types.ObjectId(appointment_id)
        caseRecord.status = 'pending'
        this.logger.log(`Case ${caseRecord._id} chuyển sang trạng thái pending`)
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
        this.logger.log(`Case ${caseRecord._id} chuyển sang trạng thái assigned`)
        break

      case 'assigned':
        // Kiểm tra trạng thái appointment
        if (caseRecord?.appointmentId) {
          const appointment = await this.appointmentService.findOne(
            caseRecord.appointmentId.toString(),
          )
          if (appointment.status !== 'COMPLETED') {
            throw new BadRequestException('Lịch hẹn chưa được hoàn tất')
          }
        }

        if (medical_form) caseRecord.medicalForm = medical_form
        caseRecord.status = 'completed'
        this.logger.log(`Case ${caseRecord._id} chuyển sang trạng thái completed`)
        break

      default:
        throw new BadRequestException('Không thể submit ở trạng thái hiện tại')
    }

    await caseRecord.save()
    return {
      message: 'Cập nhật bệnh án thành công',
      data: {
        case_id: caseRecord._id,
        ...caseRecord.toObject(),
      },
    }
  }

  private async handleSendbackAction(caseRecord: CaseDocument) {
    if (caseRecord.status !== 'assigned') {
      throw new BadRequestException('Chỉ trả lại case khi đang ở trạng thái assigned')
    }

    caseRecord.status = 'draft'
    await caseRecord.save()

    this.logger.log(`Case ${caseRecord._id} đã được trả về trạng thái draft`)
    return {
      message: 'Đã trả bệnh án về trạng thái nháp',
      data: {
        case_id: caseRecord._id,
        ...caseRecord.toObject(),
      },
    }
  }

  // Phương thức để cập nhật case khi appointment thay đổi
  async updateCaseStatusByAppointment(appointmentId: string, appointmentStatus: string) {
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
            `Case ${caseRecord._id} tự động chuyển sang assigned do appointment được xác nhận`,
          )
        }
        break

      case 'COMPLETED':
        if (caseRecord.status === 'assigned') {
          this.logger.log(
            `Appointment ${appointmentId} đã hoàn thành, case ${caseRecord._id} có thể chuyển sang completed`,
          )
        }
        break
    }

    await caseRecord.save()
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
    console.log('id', id)
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
      .lean()

    if (!record) throw new NotFoundException('Không tìm thấy bệnh án')

    // Kiểm tra quyền truy cập
    if (user.role === 'PATIENT') {
      if (record.patient.toString() !== user.userId) {
        throw new BadRequestException('Bạn không có quyền truy cập bệnh án này')
      }
    } else if (user.role === 'DOCTOR') {
      const appointment = record.appointmentId as any
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

    return { ...record, offerSummary }
  }

  async findAll(user: JwtPayload, page = 1, limit = 10, q?: string, status?: CaseStatus) {
    const filter: any = {
      isDeleted: false,
    }

    // Nếu là bệnh nhân, chỉ xem case của mình
    if (user.role === 'PATIENT') {
      filter.patient = user.userId
    }
    // Nếu là bác sĩ, xem các case được gán thông qua appointment
    else if (user.role === 'DOCTOR') {
      const doctorAppointments = await this.appointmentService.findByDoctor(user.userId)
      const appointmentIds = doctorAppointments.map(app => app._id)
      filter.appointmentId = { $in: appointmentIds }
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
      .populate({ path: 'specialty', select: 'name' })
      .lean()

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

  async getAllCase(page = 1, limit = 10, q?: string, status?: CaseStatus) {
    const filter: any = {
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
      .populate({ path: 'specialty', select: 'name' }) // đúng với schema
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
