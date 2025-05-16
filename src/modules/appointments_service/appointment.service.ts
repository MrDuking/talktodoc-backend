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
import mongoose, { Model } from 'mongoose'
import { CreateAppointmentDto, UpdateAppointmentDto } from './dtos/index'
import { Appointment } from './schemas/appointment.schema'

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
      patient,
      doctor,
      specialty,
      date,
      slot,
      timezone: timezone || 'Asia/Ho_Chi_Minh',
      status: 'PENDING',
    })

    const savedAppointment = await appointment.save()

    caseRecord.appointmentId = new mongoose.Types.ObjectId(savedAppointment._id as string)
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
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'specialty' },
      })
      .populate('specialty')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec()

    return { total, page, limit, data }
  }

  async findOne(id: string): Promise<AppointmentResponse> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: ['specialty', 'rank'],
      })
      .populate('specialty')
      .lean()

    if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn')

    const formattedDate = new Date(appointment.date).toISOString()

    return {
      _id: appointment._id.toString(),
      appointmentId: appointment.appointmentId,
      patient: appointment.patient as Patient,
      doctor: appointment.doctor as Doctor,
      specialty: appointment.specialty as Specialty,
      status: appointment.status,
      date: formattedDate,
      slot: appointment.slot,
      timezone: appointment.timezone,
      booking: {
        date: formattedDate,
        slot: appointment.slot,
        timezone: appointment.timezone,
      },
    }
  }

  async update(id: string, updateDto: UpdateAppointmentDto): Promise<Appointment> {
    const updated = await this.appointmentModel.findByIdAndUpdate(id, updateDto, { new: true })
    if (!updated) throw new NotFoundException('Không tìm thấy lịch hẹn')
    return updated
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
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'specialty' },
      })
      .populate('specialty')

    if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn')

    if (appointment?.doctor?._id?.toString() !== doctorId) {
      throw new Error('Bạn không phải là bác sĩ được đặt lịch hẹn')
    }

    if (appointment.status !== 'PENDING') {
      throw new BadRequestException('Lịch hẹn không đang ở trạng thái chờ')
    }

    appointment.status = 'CONFIRMED'
    appointment.confirmedAt = new Date()
    if (note) appointment.doctorNote = note
    await appointment.save()

    const patient = await this.appointmentModel.findById(id).populate('patient')
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
      console.log('Email đã được gửi cho bác sĩ')
    }
    return { message: 'Lịch hẹn đã được xác nhận và email đã được gửi.' }
  }

  async rejectAppointment(
    id: string,
    doctorId: string,
    reason: string,
  ): Promise<{ message: string }> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'specialty' },
      })
      .populate('specialty')

    if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn')

    const appointmentDoctorId =
      appointment.doctor instanceof mongoose.Types.ObjectId
        ? appointment.doctor.toString()
        : appointment.doctor._id.toString()

    if (appointmentDoctorId !== doctorId) {
      throw new ForbiddenException('Bạn không phải là bác sĩ được giao')
    }

    if (appointment.status !== 'PENDING') {
      throw new BadRequestException('Lịch hẹn không đang ở trạng thái chờ')
    }

    appointment.status = 'REJECTED'
    appointment.cancelledAt = new Date()
    appointment.doctorNote = reason
    await appointment.save()

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
      console.log('Email đã được gửi cho bác sĩ')
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
}
