import { MailService } from "@modules/mail/mail.service"
import { UsersService } from "@modules/user-service/user.service"
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import mongoose, { Model } from "mongoose"
import { CreateAppointmentDto, UpdateAppointmentDto } from "./dtos/index"
import { Appointment } from "./schemas/appointment.schema"

@Injectable()
export class AppointmentService {
    private readonly logger = new Logger(AppointmentService.name)

    constructor(
        @InjectModel(Appointment.name)
        private readonly appointmentModel: Model<Appointment>,
        private readonly usersService: UsersService,
        private readonly mailService: MailService
    ) {}

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

    async findAppointments(query?: string, page = 1, limit = 10) {
        const filter: any = {}
        if (query) {
            const regex = { $regex: query, $options: "i" }
            filter.$or = [{ appointmentId: regex }, { date: regex }, { status: regex }]
        }

        const total = await this.appointmentModel.countDocuments(filter)
        const data = await this.appointmentModel
            .find(filter)
            .populate("patient")
            .populate("doctor")
            .populate("specialty")
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

        if (!appointment) throw new NotFoundException("Appointment not found")

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
        const updated = await this.appointmentModel.findByIdAndUpdate(id, updateDto, {
            new: true
        })
        if (!updated) throw new NotFoundException("Appointment not found")
        return updated
    }

    async remove(id: string) {
        const deleted = await this.appointmentModel.findByIdAndDelete(id)
        if (!deleted) throw new NotFoundException("Appointment not found")
        return { message: "Deleted successfully" }
    }

    async confirmAppointment(id: string, doctorId: string, note?: string) {
        const appointment = await this.appointmentModel.findById(id).populate("patient doctor specialty")

        if (!appointment) throw new NotFoundException("Appointment not found")

        const appointmentDoctorId = appointment.doctor instanceof mongoose.Types.ObjectId ? appointment.doctor.toString() : appointment.doctor._id.toString()

        if (appointmentDoctorId !== doctorId) {
            console.log(" Doctor in appointment:", appointmentDoctorId)
            console.log("Logged-in doctorId:", doctorId)
            throw new ForbiddenException("You are not the assigned doctor")
        }

        if (appointment.status !== "PENDING") {
            throw new BadRequestException("Appointment must be in pending state")
        }

        appointment.status = "CONFIRMED"
        appointment.confirmedAt = new Date()
        if (note) appointment.doctorNote = note
        await appointment.save()

        const patient = await this.usersService.findOneUser(
            appointment.patient instanceof mongoose.Types.ObjectId ? appointment.patient.toString() : appointment.patient._id.toString()
        )

        if (patient?.email) {
            await this.mailService.sendTemplateMail({
                to: patient.email,
                subject: "TalkToDoc : Lịch hẹn đã được xác nhận",
                template: "appointment-confirm",
                variables: {
                    name: patient.fullName,
                    doctor: appointment.doctor.fullName,
                    date: appointment.date,
                    slot: appointment.slot,
                    specialty: appointment.specialty.name,
                    note: note || "",
                    link: "https://www.talktodoc.online/"
                }
            })
        }

        return { message: "Appointment confirmed and email sent" }
    }

    async rejectAppointment(id: string, doctorId: string, reason: string) {
        const appointment = await this.appointmentModel.findById(id).populate("patient doctor specialty")

        if (!appointment) throw new NotFoundException("Appointment not found")
        const appointmentDoctorId = appointment.doctor instanceof mongoose.Types.ObjectId ? appointment.doctor.toString() : appointment.doctor._id.toString()

        if (appointmentDoctorId !== doctorId) {
            console.log(" Doctor in appointment:", appointmentDoctorId)
            console.log("Logged-in doctorId:", doctorId)
            throw new ForbiddenException("You are not the assigned doctor")
        }
        if (appointment.status !== "PENDING") throw new BadRequestException("Appointment must be in pending state")

        appointment.status = "REJECTED"
        appointment.cancelledAt = new Date()
        appointment.doctorNote = reason
        await appointment.save()

        const patient = await this.usersService.findOneUser(appointment.patient.toString())
        if (patient?.email) {
            await this.mailService.sendTemplateMail({
                to: patient.email,
                subject: "Lịch hẹn bị từ chối",
                template: "appointment-reject",
                variables: {
                    name: patient.fullName,
                    doctor: appointment.doctor.fullName,
                    date: appointment.date,
                    slot: appointment.slot,
                    specialty: appointment.specialty.name,
                    reason,
                    link: "https://www.talktodoc.online/"
                }
            })
        }

        return { message: "Appointment rejected and email sent" }
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
