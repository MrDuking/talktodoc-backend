import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { PaymentService } from "@modules/payment_serivce/payment.service"
import { SpecialityService } from "@modules/speciality_service/speciality.service"
import { UsersService } from "@/modules/user-service"
import {
  CreateAppointmentDto,
  UpdateAnswersDto,
  UpdateDoctorAndTimeDto,
  UpdatePaymentStatusDto,
} from "./dtos/index"
import { Appointment, AppointmentDocument } from "./schemas/appointment.schema"

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    private readonly specialityService: SpecialityService,
    private readonly usersService: UsersService,
    private readonly paymentService: PaymentService,
  ) {}

  async createAppointment(dto: CreateAppointmentDto, patientId: Types.ObjectId) {
    await this.specialityService.getSpecialityById(dto.specialty)

    return this.appointmentModel.create({
      patient: patientId,
      specialty: dto.specialty,
      answers_data: {},
      doctor: null,
      start_time: null,
      end_time: null,
      billing_status: null,
      status: "INIT",
    })
  }

  async updateAnswers(id: string, dto: UpdateAnswersDto, patientId: Types.ObjectId) {
    const appointment = await this.findOwnedAppointment(id, patientId)
    appointment.answers_data = dto.answers_data
    appointment.status = "ANSWERED"
    return appointment.save()
  }

  async updateDoctorAndTime(id: string, dto: UpdateDoctorAndTimeDto, patientId: Types.ObjectId) {
    const appointment = await this.findOwnedAppointment(id, patientId)

    if (new Date(dto.start_time) >= new Date(dto.end_time)) {
      throw new BadRequestException("Start time must be before end time")
    }

    const doctor = await this.usersService.getDoctorById(dto.doctor) as any;
    if (!doctor.specialty.map((s: any) => s.toString()).includes(appointment.specialty.toString())) {
      throw new BadRequestException("Doctor does not belong to the selected speciality")
    }

    appointment.doctor = new Types.ObjectId(doctor._id);
    appointment.start_time = new Date(dto.start_time)
    appointment.end_time = new Date(dto.end_time)
    appointment.status = "SELECTED_DOCTOR"
    return appointment.save()
  }

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto, patientId: Types.ObjectId) {
    const appointment = await this.findOwnedAppointment(id, patientId)

    if (!appointment.doctor || !appointment.start_time || !appointment.end_time) {
      throw new BadRequestException("Cannot mark appointment as paid without doctor and time slot")
    }

    const isPaid = await this.paymentService.verifyTransaction(id, patientId.toString())
    if (!isPaid) {
      throw new BadRequestException("Payment has not been verified")
    }

    appointment.billing_status = dto.billing_status
    appointment.status = "PAID"
    return appointment.save()
  }

  private async findOwnedAppointment(id: string, patientId: Types.ObjectId): Promise<AppointmentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid appointment ID")
    }

    const appointment = await this.appointmentModel.findById(id)
    if (!appointment || appointment.patient.toString() !== patientId.toString()) {
      throw new NotFoundException("Appointment not found or access denied")
    }

    return appointment
  }
}