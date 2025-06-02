import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
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
}
