import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  AppointmentBySpecialtyRangeResponseDto,
  AppointmentBySpecialtyRequestDto,
  AppointmentBySpecialtyYearDto,
} from './dtos/appointment-by-specialty.dto'
import {
  AppointmentStatusSummaryItemDto,
  AppointmentStatusSummaryRequestDto,
} from './dtos/appointment-status-summary.dto'
import { SummaryAnalystRequestDto, SummaryAnalystResponseDto } from './dtos/summary-analyst.dto'
import { TopDoctorItemDto, TopDoctorsRequestDto } from './dtos/top-doctors.dto'
import { ReportService } from './report.service'

@ApiTags('Reports')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('summary-analyst')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'API thống kê tổng hợp',
    description:
      'API để thống kê số lượng bệnh nhân, bác sĩ, cuộc hẹn hoặc doanh thu theo khoảng thời gian tùy chỉnh hoặc mặc định tháng hiện tại',
  })
  @ApiBody({
    type: SummaryAnalystRequestDto,
    description: 'Payload yêu cầu với loại thống kê và khoảng thời gian tùy chỉnh (optional)',
    examples: {
      patient_current_month: {
        summary: 'Thống kê bệnh nhân - tháng hiện tại',
        value: { typeSummary: 'patient' },
      },
      doctor_custom_range: {
        summary: 'Thống kê bác sĩ - khoảng thời gian tùy chỉnh',
        value: {
          typeSummary: 'doctor',
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          },
        },
      },
      appointment_quarter: {
        summary: 'Thống kê cuộc hẹn - theo quý',
        value: {
          typeSummary: 'appointment',
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-03-31',
          },
        },
      },
      revenue_week: {
        summary: 'Thống kê doanh thu - theo tuần',
        value: {
          typeSummary: 'revenue',
          dateRange: {
            startDate: '2024-12-01',
            endDate: '2024-12-07',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Thành công',
    type: SummaryAnalystResponseDto,
    schema: {
      example: {
        message: 'Thống kê thành công',
        data: {
          percent: 0.2,
          total: 4876,
          series: [20, 41, 63, 33],
        },
        status: 200,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
    schema: {
      example: {
        message: 'Validation failed',
        status: 400,
      },
    },
  })
  async getSummaryAnalyst(@Body() request: SummaryAnalystRequestDto): Promise<{
    message: string
    data: SummaryAnalystResponseDto
    status: number
  }> {
    const data = await this.reportService.getSummaryAnalyst(request)

    return {
      message: 'Thống kê thành công',
      data,
      status: 200,
    }
  }

  @Post('top-doctors')
  @HttpCode(HttpStatus.OK)
  async topDoctors(
    @Body() dto: TopDoctorsRequestDto,
  ): Promise<{ message: string; data: TopDoctorItemDto[]; status: number }> {
    const data = await this.reportService.topDoctors(dto)
    return { message: 'Success', data, status: 200 }
  }

  @Post('appointment-status-summary')
  @HttpCode(HttpStatus.OK)
  async appointmentStatusSummary(
    @Body() dto: AppointmentStatusSummaryRequestDto,
  ): Promise<{ message: string; data: AppointmentStatusSummaryItemDto[]; status: number }> {
    const data = await this.reportService.appointmentStatusSummary(dto)
    return { message: 'Success', data, status: 200 }
  }

  @Post('appointment-by-specialty')
  @HttpCode(HttpStatus.OK)
  async appointmentBySpecialty(@Body() dto: AppointmentBySpecialtyRequestDto): Promise<{
    message: string
    data: AppointmentBySpecialtyYearDto[] | AppointmentBySpecialtyRangeResponseDto
    status: number
  }> {
    const data = await this.reportService.appointmentBySpecialty(dto)
    return { message: 'Success', data, status: 200 }
  }

  @Get('review-doctor')
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Tìm kiếm theo tên bác sĩ',
  })
  @ApiQuery({
    name: 'doctorId',
    required: false,
    type: String,
    description: 'Tìm kiếm theo mã bác sĩ',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Trang hiện tại (mặc định 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang (mặc định 20)',
  })
  async getReviewDoctorStats(
    @Query('name') name?: string,
    @Query('doctorId') doctorId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    message: string
    data: {
      items: {
        doctorId: string
        name: string
        avgRating: number
        reviewCount: number
        reviewDetails: { ratingScore: number; description: string; appointmentId?: string }[]
      }[]
      page: number
      pageSize: number
      total: number
    }
    status: number
  }> {
    const data = await this.reportService.getDoctorReviewStats({ name, doctorId, page, pageSize })
    return {
      message: 'Lấy danh sách thống kê đánh giá bác sĩ thành công',
      status: 200,
      data,
    }
  }

  @Get('specialty-statistics')
  @ApiOperation({
    summary: 'Báo cáo chuyên khoa',
    description:
      'Trả về danh sách thống kê các chuyên khoa, bao gồm: số lượt khám, doanh thu, số bác sĩ, đánh giá trung bình, phần trăm tăng/giảm so với kỳ trước.',
  })
  @ApiQuery({
    name: 'timeRange',
    required: true,
    type: String,
    description: 'Khoảng thời gian: week, month, quarter, custom',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Ngày bắt đầu (YYYY-MM-DD, dùng khi timeRange=custom)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Ngày kết thúc (YYYY-MM-DD, dùng khi timeRange=custom)',
  })
  @ApiQuery({
    name: 'specialty',
    required: false,
    type: String,
    description: 'Mã chuyên khoa (lọc theo chuyên khoa, "all" để lấy tất cả)',
  })
  @ApiQuery({
    name: 'hospital',
    required: false,
    type: String,
    description: 'Mã cơ sở y tế (nếu có, "all" để lấy tất cả)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Trang hiện tại (mặc định 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Số dòng/trang (mặc định 20)',
  })
  async getSpecialtyStatistics(
    @Query('timeRange') timeRange: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('specialty') specialty?: string,
    @Query('hospital') hospital?: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ): Promise<{
    message: string
    data: {
      items: any[]
      page: number
      pageSize: number
      total: number
    }
    status: number
  }> {
    const data = await this.reportService.getSpecialtyStatistics({
      timeRange,
      startDate,
      endDate,
      specialty,
      hospital,
      page,
      pageSize,
    })
    return {
      message: 'Lấy báo cáo chuyên khoa thành công',
      status: 200,
      data,
    }
  }
}
