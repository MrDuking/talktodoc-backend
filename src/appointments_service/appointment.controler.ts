import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
    UnauthorizedException,
  } from "@nestjs/common";
  import { Request } from "express";
  import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
  import { AppointmentService } from "./appointment.service";
  import { CreateAppointmentDto, UpdateAppointmentDto } from "./dtos/index";
  import { RolesGuard } from "@/modules/auth/guards/roles.guard";
  import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
  import { Roles } from "@/modules/auth/decorators/roles.decorator";
  import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";

  @ApiTags("Appointments")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller("appointments")
  export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) {}

    @Post()
    @ApiOperation({ summary: "Create a new appointment (Step 1: Select specialty)" })
    async create(
        @Body() dto: CreateAppointmentDto,
        @Req() req: Request & { user?: JwtPayload }
      ) {
        console.log(" User từ token:", req.user);

        const patientId = req.user?.userId;
        if (!patientId) throw new UnauthorizedException("Patient not found in token");

        return this.appointmentService.create({
          ...dto,
          patient: patientId,
        } as CreateAppointmentDto & { patient: string });
      }

    @Get()
    @ApiOperation({ summary: "Retrieve appointment list or search" })
    @ApiQuery({ name: "q", required: false, description: "Search keyword" })
    @ApiQuery({ name: "page", required: false, description: "Page number" })
    @ApiQuery({ name: "limit", required: false, description: "Items per page" })
    async findAll(
      @Query("q") q?: string,
      @Query("page") page = 1,
      @Query("limit") limit = 10
    ) {
      return this.appointmentService.findAppointments(q, +page, +limit);
    }

    @Get(":id")
    @ApiOperation({ summary: "View appointment details" })
    async findOne(@Param("id") id: string) {
      return this.appointmentService.findOne(id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update appointment information (Step 2–4)" })
    async update(@Param("id") id: string, @Body() dto: UpdateAppointmentDto) {
      return this.appointmentService.update(id, dto);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete an appointment (admin only)" })
    @HttpCode(204)
    async remove(@Param("id") id: string) {
      await this.appointmentService.remove(id);
    }

    @Patch(":id/confirm")
    @ApiOperation({ summary: "Doctor confirms the appointment" })
    @UseGuards(RolesGuard)
    @Roles("DOCTOR")
    async confirm(
      @Param("id") id: string,
      @Req() req: Request & { user?: JwtPayload },
      @Body("note") note?: string
    ) {
      const doctorId = req.user?.userId;
      if (!doctorId) throw new UnauthorizedException("Doctor not authenticated");
      return this.appointmentService.confirmAppointment(id, doctorId, note);
    }

    @Patch(":id/reject")
    @ApiOperation({ summary: "Doctor rejects the appointment" })
    @UseGuards(RolesGuard)
    @Roles("DOCTOR")
    async reject(
      @Param("id") id: string,
      @Req() req: Request & { user?: JwtPayload },
      @Body("reason") reason: string
    ) {
      const doctorId = req.user?.userId;
      if (!doctorId) throw new UnauthorizedException("Doctor not authenticated");
      return this.appointmentService.rejectAppointment(id, doctorId, reason);
    }
  }
