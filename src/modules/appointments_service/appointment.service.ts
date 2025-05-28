import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface'
import { Case } from '@/modules/case/schemas/case.schema'
import { MailService } from '@modules/mail/mail.service'
import { UsersService } from '@modules/user-service/user.service'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model, Types } from 'mongoose'
import { CreateAppointmentDto, UpdateAppointmentDto } from './dtos/index'
import { Appointment } from './schemas/appointment.schema'

// Định nghĩa các interface cho dữ liệu đã populate
interface Patient {
  _id: string
  fullName: string
  email: string
}

interface Doctor {
  _id: string
  fullName: string
  email: string
  specialty: Specialty
}

interface Specialty {
  _id: string
  name: string
}

// Interface cho appointment đã được populate
interface PopulatedAppointment {
  _id: Types.ObjectId
  appointmentId: string
  patient: Patient
  doctor: Doctor
  specialty: Specialty
  status: string
  date: string
  slot: string
  timezone: string
  payment?: {
    platformFee: number
    doctorFee: number
    discount: number
    total: number
    status: string
    paymentMethod?: string
  }
  reason?: string
  doctorNote?: string
  confirmedAt?: Date
  cancelledAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

interface AppointmentResponse {
  _id: string
  appointmentId: string
  patient: Patient
  doctor: Doctor
  specialty: Specialty
  status: string
  date: string
  slot: string
  timezone: string
  booking: {
    date: string
    slot: string
    timezone: string
  }
}

// Interface cho appointment khi trả về từ findByDoctor
interface DoctorAppointment {
  _id: string
  appointmentId: string
  patient: Patient
  specialty: Specialty
  date: string
  slot: string
  status: string
}

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name)

  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Case.name)
    private readonly caseModel: Model<Case>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async migrateDefaultStatus(): Promise<void> {
    await this.appointmentModel.updateMany(
      { status: { $exists: true } },
      { $set: { status: 'PENDING' } },
    )
  }

  async create(createDto: CreateAppointmentDto & { patient: string }): Promise<Appointment> {
    const { case_id, specialty, doctor, date, slot, timezone, patient } = createDto

    if (!case_id || !doctor || !date || !slot || !specialty) {
      throw new BadRequestException('Vui lòng cung cấp đầy đủ thông tin để đặt lịch hẹn')
    }

    const caseRecord = await this.caseModel.findById(case_id)
    if (!caseRecord) throw new NotFoundException('Không tìm thấy bệnh án')
    if (caseRecord.patient.toString() !== patient) {
      throw new ForbiddenException('Bạn không có quyền tạo lịch hẹn cho case này')
    }

    const appointmentId = await this.generateUniqueAppointmentId()

    const appointment = new this.appointmentModel({
      appointmentId,
      patient: new mongoose.Types.ObjectId(patient),
      doctor,
      specialty,
      date,
      slot,
      timezone: timezone || 'Asia/Ho_Chi_Minh',
      status: 'PENDING',
    })

    const savedAppointment = await appointment.save()

    caseRecord.appointmentId = new mongoose.Types.ObjectId(savedAppointment._id)
    await caseRecord.save()

    return savedAppointment
  }

  async findAppointments(
    user: JwtPayload,
    query?: string,
    page = 1,
    limit = 10,
  ): Promise<{ total: number; page: number; limit: number; data: Appointment[] }> {
    const filter: Record<string, unknown> = {}
    if (query) {
      const regex = { $regex: query, $options: 'i' }
      filter.$or = [{ appointmentId: regex }, { date: regex }, { status: regex }]
    }

    const total = await this.appointmentModel.countDocuments(filter)
    const data = await this.appointmentModel
      .find(filter)
      .populate({
        path: 'doctor',
        populate: { path: 'specialty' },
      })
      .populate('specialty')
      .populate('patient')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec()

    return { total, page, limit, data }
  }

  async findOne(id: string): Promise<AppointmentResponse> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate({
        path: 'doctor',
        populate: ['specialty', 'rank'],
      })
      .populate('specialty')
      .populate('patient')
      .lean()

    if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn')

    const formattedDate = new Date(appointment.date).toISOString()

    // Sử dụng type assertion để TypeScript hiểu đúng kiểu dữ liệu
    const populatedAppointment = appointment as unknown as PopulatedAppointment

    return {
      _id: populatedAppointment._id.toString(),
      appointmentId: populatedAppointment.appointmentId,
      patient: populatedAppointment.patient,
      doctor: populatedAppointment.doctor,
      specialty: populatedAppointment.specialty,
      status: populatedAppointment.status,
      date: formattedDate,
      slot: populatedAppointment.slot,
      timezone: populatedAppointment.timezone,
      booking: {
        date: formattedDate,
        slot: populatedAppointment.slot,
        timezone: populatedAppointment.timezone,
      },
    }
  }

  async update(
    id: string,
    updateDto: UpdateAppointmentDto,
  ): Promise<{ message: string; data: Appointment }> {
    const appointment = await this.appointmentModel.findById(id)
    if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn')
    console.log(updateDto)
    // Nếu có payment, merge từng field vào payment cũ
    if (updateDto.payment) {
      appointment.payment = {
        ...appointment.payment,
        ...updateDto.payment,
      } as typeof appointment.payment
      delete updateDto.payment
    }
    if (updateDto.duration_call) {
      appointment.duration_call = updateDto.duration_call
      delete updateDto.duration_call
    }
    // Xử lý hủy lịch hẹn
    if (updateDto.status === 'CANCELLED') {
      appointment.status = 'CANCELLED'
      appointment.cancelledAt = new Date()
      appointment.reason = updateDto.reason || 'Không có lý do'

      // Hoàn tiền vào ví của bệnh nhân nếu đã thanh toán
      if (appointment.payment?.status === 'PAID') {
        const refundAmount = appointment.payment.total
        const patientId = appointment.patient.toString()

        try {
          await this.usersService.updateWalletBalance(
            patientId,
            refundAmount,
            'REFUND',
            `Hoàn tiền từ lịch hẹn ${appointment.appointmentId} bị hủy: ${appointment.reason}`,
          )
          this.logger.log(`Đã hoàn ${refundAmount}đ vào ví của bệnh nhân ${patientId}`)
        } catch (error) {
          this.logger.error('Lỗi khi hoàn tiền:', error)
        }
      }

      // Cập nhật trạng thái case
      await this.caseModel.findOneAndUpdate(
        { appointmentId: appointment._id },
        { $set: { status: 'cancelled' } },
      )

      // Gửi email thông báo hủy lịch hẹn
      try {
        const populatedAppointment = (await this.appointmentModel
          .findById(id)
          .populate('patient')
          .populate('doctor')
          .populate('specialty')
          .lean()) as unknown as PopulatedAppointment

        // Gửi email cho bệnh nhân
        if (populatedAppointment?.patient?.email) {
          await this.mailService.sendTemplateMail({
            to: populatedAppointment.patient.email,
            subject: 'TalkToDoc : Lịch hẹn đã bị hủy',
            template: 'appointment-cancel-patient',
            variables: {
              name: populatedAppointment.patient.fullName,
              doctor: populatedAppointment.doctor?.fullName,
              date: populatedAppointment.date,
              slot: populatedAppointment.slot,
              specialty: populatedAppointment.specialty?.name,
              reason: appointment.reason,
              link: 'https://www.talktodoc.online/',
              payment:
                appointment.payment?.status === 'PAID'
                  ? {
                      amount: appointment.payment.total,
                    }
                  : null,
            },
          })
        }

        // Gửi email cho bác sĩ
        if (populatedAppointment?.doctor?.email) {
          await this.mailService.sendTemplateMail({
            to: populatedAppointment.doctor.email,
            subject: 'TalkToDoc : Có lịch hẹn bị hủy',
            template: 'appointment-cancel-doctor',
            variables: {
              name: populatedAppointment.doctor.fullName,
              patient: populatedAppointment.patient.fullName,
              date: populatedAppointment.date,
              slot: populatedAppointment.slot,
              reason: appointment.reason,
              link: 'https://www.talktodoc.online/doctor/schedule',
            },
          })
        }
      } catch (error) {
        this.logger.error('Lỗi khi gửi email thông báo hủy:', error)
      }
    } else {
      // Cập nhật các field khác
      const rest = updateDto as Partial<Appointment>
      Object.keys(rest).forEach(key => {
        if (key !== 'payment' && rest[key as keyof typeof rest] !== undefined) {
          // @ts-expect-error: Gán động field cho appointment do DTO có thể chứa các field không khai báo rõ ràng trong type
          appointment[key] = rest[key as keyof typeof rest]
        }
      })
    }

    await appointment.save()
    return { message: 'Lịch hẹn đã được cập nhật', data: appointment }
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.appointmentModel.findByIdAndDelete(id)
    if (!deleted) throw new NotFoundException('Không tìm thấy lịch hẹn ')
    return { message: 'Lịch hẹn đã được xóa' }
  }

  async confirmAppointment(
    id: string,
    doctorId: string,
    note?: string,
  ): Promise<{ message: string }> {
    const appointment = (await this.appointmentModel
      .findById(id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'specialty' },
      })
      .populate('specialty')
      .lean()) as unknown as PopulatedAppointment

    if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn')

    if (appointment?.doctor?._id?.toString() !== doctorId) {
      throw new Error('Bạn không phải là bác sĩ được đặt lịch hẹn')
    }

    if (appointment.status !== 'PENDING') {
      throw new BadRequestException('Lịch hẹn không đang ở trạng thái chờ')
    }

    await this.appointmentModel.findByIdAndUpdate(id, {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
      doctorNote: note,
    })

    // Cập nhật trạng thái case
    await this.caseModel.findOneAndUpdate(
      { appointmentId: new Types.ObjectId(id) },
      { $set: { status: 'assigned' } },
    )

    const patient = (await this.appointmentModel
      .findById(id)
      .populate('patient')
      .lean()) as unknown as PopulatedAppointment

    if (patient?.patient?.email) {
      await this.mailService.sendTemplateMail({
        to: patient.patient.email,
        subject: 'TalkToDoc : Lịch hẹn đã được xác nhận',
        template: 'appointment-confirm-patient',
        variables: {
          name: patient.patient.fullName,
          doctor: appointment?.doctor?.fullName,
          date: appointment.date,
          slot: appointment.slot,
          specialty: appointment?.specialty?.name,
          note: note || '',
          link: 'https://www.talktodoc.online/',
        },
      })
    }
    if (appointment?.doctor?.email) {
      await this.mailService.sendTemplateMail({
        to: appointment.doctor.email,
        subject: 'TalkToDoc : Lịch hẹn đã được xác nhận',
        template: 'doctor-confirm',
        variables: {
          name: appointment.doctor.fullName,
          patient: appointment.patient.fullName,
          date: appointment.date,
          slot: appointment.slot,
          note: note || '',
          link: 'https://www.talktodoc.online/',
        },
      })
      this.logger.log('Email đã được gửi cho bác sĩ')
    }
    return { message: 'Lịch hẹn đã được xác nhận và email đã được gửi.' }
  }

  async rejectAppointment(
    id: string,
    doctorId: string,
    reason: string,
  ): Promise<{ message: string }> {
    const appointment = (await this.appointmentModel
      .findById(id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'specialty' },
      })
      .populate('specialty')
      .lean()) as unknown as PopulatedAppointment

    if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn')

    const appointmentDoctorId = appointment.doctor._id.toString()

    if (appointmentDoctorId !== doctorId) {
      throw new ForbiddenException('Bạn không phải là bác sĩ được giao')
    }

    if (appointment.status !== 'PENDING') {
      throw new BadRequestException('Lịch hẹn không đang ở trạng thái chờ')
    }

    await this.appointmentModel.findByIdAndUpdate(id, {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      doctorNote: reason,
    })

    if (appointment.payment?.status === 'PAID') {
      const refundAmount = appointment.payment.total
      const patientId = appointment.patient._id.toString()

      try {
        await this.usersService.updateWalletBalance(
          patientId,
          refundAmount,
          'REFUND',
          `Hoàn tiền từ lịch hẹn ${appointment.appointmentId} bị hủy`,
        )
        this.logger.log(`Đã hoàn ${refundAmount}đ vào ví của bệnh nhân ${patientId}`)
      } catch (error) {
        this.logger.error('Lỗi khi hoàn tiền:', error)
      }
    }

    // Cập nhật trạng thái case
    await this.caseModel.findOneAndUpdate(
      { appointmentId: new Types.ObjectId(id) },
      { $set: { status: 'cancelled' } },
    )

    const patient = appointment.patient

    if (patient?.email) {
      await this.mailService.sendTemplateMail({
        to: patient.email,
        subject: 'TalkToDoc : Lịch hẹn bị từ chối',
        template: 'appointment-reject-patient',
        variables: {
          name: patient.fullName,
          doctor: appointment.doctor.fullName,
          date: appointment.date,
          slot: appointment.slot,
          specialty: appointment.specialty?.name,
          reason,
          link: 'https://www.talktodoc.online/',
        },
      })
    }

    if (appointment?.doctor?.email) {
      await this.mailService.sendTemplateMail({
        to: appointment.doctor.email,
        subject: 'Bạn vừa từ chối một lịch hẹn',
        template: 'doctor-reject',
        variables: {
          name: appointment.doctor.fullName,
          patient: patient?.fullName,
          date: appointment.date,
          slot: appointment.slot,
          note: reason,
          link: 'https://www.talktodoc.online/',
        },
      })
      this.logger.log('Email đã được gửi cho bác sĩ')
    }

    return { message: 'Lịch hẹn đã được từ chối và email đã được gửi.' }
  }

  private async generateUniqueAppointmentId(): Promise<string> {
    let unique = false
    let appointmentId = ''
    while (!unique) {
      const rand = `AP${Math.floor(100000 + Math.random() * 900000)}`
      const exists = await this.appointmentModel.findOne({ appointmentId: rand })
      if (!exists) {
        appointmentId = rand
        unique = true
      }
    }
    return appointmentId
  }

  async findByDoctor(doctorId: string): Promise<DoctorAppointment[]> {
    this.logger.log(`Tìm lịch hẹn cho bác sĩ: ${doctorId}`)

    if (!Types.ObjectId.isValid(doctorId)) {
      this.logger.error('ID bác sĩ không hợp lệ')
      return []
    }

    try {
      const appointments = await this.appointmentModel
        .find({
          doctor: new Types.ObjectId(doctorId),
          status: { $in: ['CONFIRMED', 'COMPLETED'] },
        })
        .select('_id appointmentId patient specialty date slot status')
        .populate('patient', 'fullName email')
        .populate('specialty', 'name')
        .sort({ createdAt: -1 })
        .lean()

      this.logger.log(`Tìm thấy ${appointments.length} lịch hẹn`)
      return appointments as unknown as DoctorAppointment[]
    } catch (error) {
      this.logger.error('Lỗi khi tìm lịch hẹn:', error)
      return []
    }
  }

  async findManyAppointmentsByIds(ids: string[], populateDoctor = false): Promise<any[]> {
    if (populateDoctor) {
      return this.appointmentModel
        .find({ _id: { $in: ids } })
        .populate('doctor')
        .populate('patient')
        .populate('specialty')
        .lean() as unknown as Appointment[]
    }
    return this.appointmentModel.find({ _id: { $in: ids } }).lean() as unknown as Appointment[]
  }
}
