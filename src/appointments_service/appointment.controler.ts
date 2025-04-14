import { Body, Controller, Param, Patch, Post, Req, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Request } from "express"
import mongoose from "mongoose"
import { JwtAuthGuard } from "../modules/auth/guards/jwt-auth.guard"
import { AppointmentService } from "./appointment.service"
import { CreateAppointmentDto,UpdateAnswersDto,UpdateDoctorAndTimeDto,UpdatePaymentStatusDto} from "./dtos/index"


@ApiTags("Appointments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("appointments")
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) {}

    @Post()
    @ApiOperation({ summary: "Create a new appointment with selected speciality" })
    create(@Body() dto: CreateAppointmentDto, @Req() req: Request) {
        const patientId = new mongoose.Types.ObjectId((req.user as any).userId)
        return this.appointmentService.createAppointment(dto, patientId)
    }

    @Patch(":id/answers")
    @ApiOperation({ summary: "Submit medical answers for the appointment" })
    updateAnswers(@Param("id") id: string, @Body() dto: UpdateAnswersDto, @Req() req: Request) {
        const patientId = new mongoose.Types.ObjectId((req.user as any).userId)
        return this.appointmentService.updateAnswers(id, dto, patientId)
    }

    @Patch(":id/doctor")
    @ApiOperation({ summary: "Assign doctor and appointment time slot" })
    updateDoctor(@Param("id") id: string, @Body() dto: UpdateDoctorAndTimeDto, @Req() req: Request) {
        const patientId = new mongoose.Types.ObjectId((req.user as any).userId)
        return this.appointmentService.updateDoctorAndTime(id, dto, patientId)
    }

    @Patch(":id/payment")
    @ApiOperation({ summary: "Confirm payment status for the appointment" })
    updatePaymentStatus(@Param("id") id: string, @Body() dto: UpdatePaymentStatusDto, @Req() req: Request) {
        const patientId = new mongoose.Types.ObjectId((req.user as any).userId)
        return this.appointmentService.updatePaymentStatus(id, dto, patientId)
    }
}
