import { Roles } from '@/modules/auth/decorators/roles.decorator'
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/modules/auth/guards/roles.guard'
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface'
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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { Types } from 'mongoose'
import { AppointmentService, type AppointmentResponse } from './appointment.service'
import { CreateAppointmentDto, UpdateAppointmentDto } from './dtos'
import { Appointment } from './schemas/appointment.schema'

async function sendMailWithRetry(sendFn: () => Promise<any>, maxDelay = 2000): Promise<void> {
  let success = false
  let lastError
  while (!success) {
    try {
      await sendFn()
      success = true
    } catch (err: any) {
      if (err?.status === 429 || err?.response?.status === 429) {
        // Nếu bị rate limit, chờ rồi thử lại
        await new Promise(res => setTimeout(res, maxDelay))
      } else {
        lastError = err
        break // Nếu lỗi khác, không retry
      }
    }
  }
  if (!success && lastError) throw lastError
}

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới lịch hẹn (liên kết với case)' })
  async create(
    @Body() dto: CreateAppointmentDto,
    @Req() req: Request & { user?: JwtPayload },
  ): Promise<Appointment> {
    const patientId = req.user?.userId
    if (!patientId) throw new UnauthorizedException('Không xác định được người dùng')

    return this.appointmentService.create({ ...dto, patient: patientId })
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn hoặc tìm kiếm' })
  @ApiQuery({ name: 'q', required: false, description: 'Từ khóa tìm kiếm (id, ngày, trạng thái)' })
  @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang' })
  async findAll(
    @Req() req: Request & { user?: JwtPayload },
    @Query('q') q?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ total: number; page: number; limit: number; data: Appointment[] }> {
    const user = req.user
    if (!user) throw new UnauthorizedException('Token không hợp lệ')
    const result = await this.appointmentService.findAppointments(user, q, +page, +limit)
    return {
      total: result.total,
      page: +page,
      limit: +limit,
      data: result.data,
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết lịch hẹn' })
  async findOne(@Param('id') id: string): Promise<AppointmentResponse> {
    return this.appointmentService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật lịch hẹn' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ): Promise<{ message: string }> {
    return this.appointmentService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa lịch hẹn (dành cho admin)' })
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.appointmentService.remove(id)
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Bác sĩ xác nhận lịch hẹn' })
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async confirm(
    @Param('id') id: string,
    @Req() req: Request & { user?: JwtPayload },
    @Body('note') note?: string,
  ): Promise<{ message: string }> {
    const doctorId = req.user?.userId
    if (!doctorId) throw new UnauthorizedException('Bác sĩ chưa xác thực')
    await sendMailWithRetry(() => this.appointmentService.confirmAppointment(id, doctorId, note))
    return { message: 'Đã xác nhận lịch hẹn thành công.' }
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Bác sĩ từ chối lịch hẹn' })
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async reject(
    @Param('id') id: string,
    @Req() req: Request & { user?: JwtPayload },
    @Body('reason') reason: string,
  ): Promise<{ message: string }> {
    const doctorId = req.user?.userId
    if (!doctorId) throw new UnauthorizedException('Bác sĩ chưa xác thực')
    await sendMailWithRetry(() => this.appointmentService.rejectAppointment(id, doctorId, reason))
    return { message: 'Đã từ chối lịch hẹn thành công.' }
  }

  @Get('migrate-specialty')
  @ApiOperation({ summary: 'Chuyển tất cả status về PENDING (dùng migrate)' })
  @ApiResponse({ status: 200, description: 'Đã migrate status thành công.' })
  migrateSpecialty(): Promise<void> {
    return this.appointmentService.migrateDefaultStatus()
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Lấy danh sách lịch hẹn của bác sĩ' })
  @ApiQuery({ name: 'status', required: false, description: 'Lọc theo trạng thái' })
  @ApiQuery({ name: 'date', required: false, description: 'Lọc theo ngày (YYYY-MM-DD)' })
  @ApiQuery({ name: 'from_date', required: false, description: 'Lọc từ ngày (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to_date', required: false, description: 'Lọc đến ngày (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang' })
  async findByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('status') status?: string | string[],
    @Query('date') date?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ total: number; page: number; limit: number; items: Appointment[] }> {
    return this.appointmentService.findAppointmentsByDoctorId(
      new Types.ObjectId(doctorId),
      {
        status,
        date,
        from_date: fromDate,
        to_date: toDate,
      },
      +page,
      +limit,
    )
  }

  @Patch('migrate-status')
  @ApiOperation({ summary: 'Migrate toàn bộ status của appointment sang trạng thái mong muốn' })
  @ApiResponse({ status: 200, description: 'Đã migrate status thành công.' })
  async migrateStatus(@Body('status') status: string): Promise<{ message: string }> {
    await this.appointmentService.migrateStatus(status)
    return { message: 'Đã migrate status thành công.' }
  }
}
