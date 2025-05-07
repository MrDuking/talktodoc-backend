import { MailService } from "@modules/mail/mail.service"
import { UsersService } from "@modules/user-service/user.service"
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import mongoose, { Model } from "mongoose"
import { CreateAppointmentDto, UpdateAppointmentDto } from "./dtos/index"
import { Appointment } from "./schemas/appointment.schema"
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface"

@Injectable()
export class AppointmentService {
    private readonly logger = new Logger(AppointmentService.name)

    constructor(
        @InjectModel(Appointment.name)
        private readonly appointmentModel: Model<Appointment>,
        private readonly usersService: UsersService,
        private readonly mailService: MailService
    ) {}

    async migrateDefaultStatus(): Promise<void> {
        await this.appointmentModel.updateMany({ status: { $exists: true } }, { $set: { status: "PENDING" } })
    }

    async create(createDto: CreateAppointmentDto) {
        const appointmentId = await this.generateUniqueAppointmentId()
        const appointment = new this.appointmentModel({
            ...createDto,
            appointmentId,
            timezone: createDto.timezone || "Asia/Ho_Chi_Minh",
            status: "PENDING"
        })
        return appointment.save()
    }

    async findAppointments(user: JwtPayload, query?: string, page = 1, limit = 10) {
        const filter: any = {}
        if (query) {
            const regex = { $regex: query, $options: "i" }
            filter.$or = [{ appointmentId: regex }, { date: regex }, { status: regex }]
        }

        const total = await this.appointmentModel.countDocuments(filter)
        const data = await this.appointmentModel
            .find(filter)
            .populate("patient")
            .populate({
                path: "doctor",
                populate: { path: "specialty" }
            })
            // .populate("specialty")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec()

        return { total, page, limit, data }
    }

    async findOne(id: string) {
        const appointment = await this.appointmentModel
            .findById(id)
            .populate("patient")
            .populate({
                path: "doctor",
                populate: ["specialty", "rank"]
            })
            .populate("specialty")
            .lean()

        if (!appointment) throw new NotFoundException("Không tìm thấy lịch hẹn")

        return {
            ...appointment,
            booking: {
                date: appointment.date,
                slot: appointment.slot,
                timezone: appointment.timezone
            },
            date: undefined,
            slot: undefined,
            timezone: undefined
        }
    }

    async update(id: string, updateDto: UpdateAppointmentDto) {
        const updated = await this.appointmentModel.findByIdAndUpdate(id, updateDto, { new: true })
        if (!updated) throw new NotFoundException("Không tìm thấy lịch hẹn")
        return updated
    }

    async remove(id: string) {
        const deleted = await this.appointmentModel.findByIdAndDelete(id)
        if (!deleted) throw new NotFoundException("Không tìm thấy lịch hẹn ")
        return { message: "Lịch hẹn đã được xóa" }
    }

    async confirmAppointment(id: string, doctorId: string, note?: string) {
        const appointment = await this.appointmentModel
            .findById(id)
            .populate("patient")
            .populate({
                path: "doctor",
                populate: { path: "specialty" }
            })
            .populate("specialty")

        if (!appointment) throw new NotFoundException("Không tìm thấy lịch hẹn")

        if (appointment?.doctor?._id?.toString() !== doctorId) {
            throw new Error("Bạn không phải là bác sĩ được đặt lịch hẹn")
        }

        if (appointment.status !== "PENDING") {
            throw new BadRequestException("Lịch hẹn không đang ở trạng thái chờ")
        }

        appointment.status = "CONFIRMED"
        appointment.confirmedAt = new Date()
        if (note) appointment.doctorNote = note
        await appointment.save()

        const patient = await this.appointmentModel.findById(id).populate("patient")
        if (patient?.patient?.email) {
            await this.mailService.sendTemplateMail({
                to: patient.patient.email,
                subject: "TalkToDoc : Lịch hẹn đã được xác nhận",
                template: "appointment-confirm",
                variables: {
                    name: patient.patient.fullName,
                    doctor: appointment?.doctor?.fullName,
                    date: appointment.date,
                    slot: appointment.slot,
                    specialty: appointment?.specialty?.name,
                    note: note || "",
                    link: "https://www.talktodoc.online/"
                }
            })
        }
        if (appointment?.doctor?.email) {
            await this.mailService.sendTemplateMail({
                to: appointment.doctor.email,
                subject: "TalkToDoc : Lịch hẹn đã được xác nhận",
                template: "doctor-confirm",
                variables: {
                    name: appointment.doctor.fullName,
                    patient: appointment.patient.fullName,
                    date: appointment.date,
                    slot: appointment.slot,
                    note: note || "",
                    link: "https://www.talktodoc.online/"
                }
            })
            console.log("Email đã được gửi cho bác sĩ")
        }
        return { message: "Lịch hẹn đã được xác nhận và email đã được gửi." }
    }

    async rejectAppointment(id: string, doctorId: string, reason: string) {
        const appointment = await this.appointmentModel
            .findById(id)
            .populate("patient")
            .populate({
                path: "doctor",
                populate: { path: "specialty" }
            })
            .populate("specialty")

        if (!appointment) throw new NotFoundException("Không tìm thấy lịch hẹn")

        const appointmentDoctorId = appointment.doctor instanceof mongoose.Types.ObjectId
            ? appointment.doctor.toString()
            : appointment.doctor._id.toString()

        if (appointmentDoctorId !== doctorId) {
            throw new ForbiddenException("Bạn không phải là bác sĩ được giao")
        }

        if (appointment.status !== "PENDING") {
            throw new BadRequestException("Lịch hẹn không đang ở trạng thái chờ")
        }

        appointment.status = "REJECTED"
        appointment.cancelledAt = new Date()
        appointment.doctorNote = reason
        await appointment.save()

        const patient = await this.usersService.findOneUser(appointment.patient.toString())
        const doctor = await this.usersService.findOneUser(appointment.doctor._id.toString())

        if (patient?.email) {
            await this.mailService.sendTemplateMail({
                to: patient.email,
                subject: "Lịch hẹn bị từ chối",
                template: "appointment-reject-patient",
                variables: {
                    name: patient.fullName,
                    doctor: doctor?.fullName,
                    date: appointment.date,
                    slot: appointment.slot,
                    specialty: appointment.specialty?.name,
                    reason,
                    link: "https://www.talktodoc.online/"
                }
            })
        }

        if (doctor?.email) {
            await this.mailService.sendTemplateMail({
                to: doctor.email,
                subject: "Bạn đã từ chối một lịch hẹn",
                template: "appointment-reject-doctor",
                variables: {
                    name: doctor.fullName,
                    patient: patient?.fullName,
                    date: appointment.date,
                    slot: appointment.slot,
                    specialty: appointment.specialty?.name,
                    reason,
                    link: "https://www.talktodoc.online/"
                }
            })
            console.log("Email đã được gửi cho bệnh nhân")
        }
        if (appointment?.doctor?.email) {
            await this.mailService.sendTemplateMail({
                to: appointment.doctor.email,
                subject: "Bạn vừa từ chối một lịch hẹn",
                template: "doctor-reject",
                variables: {
                    name: appointment.doctor.fullName,
                    patient: appointment.patient.fullName,
                    date: appointment.date,
                    slot: appointment.slot,
                    note: reason,
                    link: "https://www.talktodoc.online/"
                }
            })
            console.log("Email đã được gửi cho bác sĩ")
        }
        return { message: "Lịch hẹn đã được từ chối và email đã được gửi." }
    }

    private async generateUniqueAppointmentId(): Promise<string> {
        let unique = false
        let appointmentId = ""
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
