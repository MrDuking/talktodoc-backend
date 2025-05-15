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
  import { AppointmentService } from './appointment.service'
  import { CreateAppointmentDto, UpdateAppointmentDto } from './dtos'
  import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
  import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface'
  import { Roles } from '@/modules/auth/decorators/roles.decorator'
  import { RolesGuard } from '@/modules/auth/guards/roles.guard'

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
    ) {
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
    ) {
      const user = req.user
      if (!user) throw new UnauthorizedException('Token không hợp lệ')
      return this.appointmentService.findAppointments(user, q, +page, +limit)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Xem chi tiết lịch hẹn' })
    async findOne(@Param('id') id: string) {
      return this.appointmentService.findOne(id)
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật lịch hẹn' })
    async update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
      return this.appointmentService.update(id, dto)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa lịch hẹn (dành cho admin)' })
    @HttpCode(204)
    async remove(@Param('id') id: string) {
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
    ) {
      const doctorId = req.user?.userId
      if (!doctorId) throw new UnauthorizedException('Bác sĩ chưa xác thực')
      return this.appointmentService.confirmAppointment(id, doctorId, note)
    }

    @Patch(':id/reject')
    @ApiOperation({ summary: 'Bác sĩ từ chối lịch hẹn' })
    @UseGuards(RolesGuard)
    @Roles('DOCTOR')
    async reject(
      @Param('id') id: string,
      @Req() req: Request & { user?: JwtPayload },
      @Body('reason') reason: string,
    ) {
      const doctorId = req.user?.userId
      if (!doctorId) throw new UnauthorizedException('Bác sĩ chưa xác thực')
      return this.appointmentService.rejectAppointment(id, doctorId, reason)
    }

    @Get('migrate-speciality')
    @ApiOperation({ summary: 'Chuyển tất cả status về PENDING (dùng migrate)' })
    @ApiResponse({ status: 200, description: 'Đã migrate status thành công.' })
    migrateSpeciality() {
      return this.appointmentService.migrateDefaultStatus()
    }
  }
