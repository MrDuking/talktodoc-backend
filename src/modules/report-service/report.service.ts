import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import moment from 'moment'
import { Model } from 'mongoose'
import { Appointment } from '../appointments_service/schemas/appointment.schema'
import { OrderMapping } from '../payment_serivce/schemas/order-mapping.schema'
import { Doctor } from '../user-service/schemas/doctor.schema'
import { Patient } from '../user-service/schemas/patient.schema'
import {
  AppointmentBySpecialtyRangeResponseDto,
  AppointmentBySpecialtyRangeSeriesDto,
  AppointmentBySpecialtyRequestDto,
  AppointmentBySpecialtyYearDto,
} from './dtos/appointment-by-specialty.dto'
import {
  AppointmentStatusSummaryItemDto,
  AppointmentStatusSummaryRequestDto,
} from './dtos/appointment-status-summary.dto'
import {
  SummaryAnalystRequestDto,
  SummaryAnalystResponseDto,
  TypeSummaryEnum,
} from './dtos/summary-analyst.dto'
import { TopDoctorItemDto, TopDoctorsRequestDto } from './dtos/top-doctors.dto'

const APPOINTMENT_STATUS_MAPPING = {
  CONFIRMED: 'Đã Xác Nhận',
  PENDING: 'Đang Chờ',
  CANCELLED: 'Đã Hủy',
  COMPLETED: 'Đã Hoàn Thành',
}

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(OrderMapping.name) private orderMappingModel: Model<OrderMapping>,
  ) {}

  async getSummaryAnalyst(request: SummaryAnalystRequestDto): Promise<SummaryAnalystResponseDto> {
    const { typeSummary, dateRange } = request

    let currentStart: moment.Moment
    let currentEnd: moment.Moment
    let previousStart: moment.Moment
    let previousEnd: moment.Moment

    if (dateRange) {
      // Sử dụng dateRange tùy chỉnh
      currentStart = moment(dateRange.startDate).startOf('day')
      currentEnd = moment(dateRange.endDate).endOf('day')

      // Tính kỳ trước có cùng độ dài
      const daysDiff = currentEnd.diff(currentStart, 'days') + 1
      previousEnd = currentStart.clone().subtract(1, 'day').endOf('day')
      previousStart = previousEnd
        .clone()
        .subtract(daysDiff - 1, 'days')
        .startOf('day')
    } else {
      // Mặc định: tháng hiện tại
      const now = moment()
      currentStart = now.clone().startOf('month')
      currentEnd = now.clone().endOf('month')
      previousStart = now.clone().subtract(1, 'month').startOf('month')
      previousEnd = now.clone().subtract(1, 'month').endOf('month')
    }
    let currentTotal = 0
    let previousTotal = 0
    const seriesData = [0, 0, 0, 0, 0, 0] // 4 phần tử

    // Chia khoảng thời gian hiện tại thành 4 phần bằng nhau
    const totalDays = currentEnd.diff(currentStart, 'days') + 1
    const daysPerSegment = Math.ceil(totalDays / 4)

    switch (typeSummary) {
      case TypeSummaryEnum.PATIENT:
        // Thống kê số lượng bệnh nhân đăng ký theo createdAt
        currentTotal = await this.patientModel.countDocuments({
          // createdAt: {
          //   // $gte: currentStart.toDate(),
          // },
        })
        console.log('currentTotal', currentTotal)
        previousTotal = await this.patientModel.countDocuments({
          createdAt: {
            $gte: previousStart.toDate(),
            $lte: previousEnd.toDate(),
          },
        })

        // Tính theo 4 phân đoạn
        for (let i = 0; i < 6; i++) {
          const segmentStart = currentStart.clone().add(i * daysPerSegment, 'days')
          const segmentEnd =
            i === 3
              ? currentEnd.clone()
              : segmentStart
                  .clone()
                  .add(daysPerSegment - 1, 'days')
                  .endOf('day')

          seriesData[i] = await this.patientModel.countDocuments({
            createdAt: {
              $gte: segmentStart.toDate(),
              $lte: segmentEnd.toDate(),
            },
          })
        }
        break

      case TypeSummaryEnum.DOCTOR:
        // Thống kê số lượng bác sĩ được duyệt theo createdAt
        currentTotal = await this.doctorModel.countDocuments({
          registrationStatus: 'approved',
          createdAt: {
            $gte: currentStart.toDate(),
            $lte: currentEnd.toDate(),
          },
        })

        previousTotal = await this.doctorModel.countDocuments({
          registrationStatus: 'approved',
          createdAt: {
            $gte: previousStart.toDate(),
            $lte: previousEnd.toDate(),
          },
        })

        // Tính theo 4 phân đoạn
        for (let i = 0; i < 4; i++) {
          const segmentStart = currentStart.clone().add(i * daysPerSegment, 'days')
          const segmentEnd =
            i === 3
              ? currentEnd.clone()
              : segmentStart
                  .clone()
                  .add(daysPerSegment - 1, 'days')
                  .endOf('day')

          seriesData[i] = await this.doctorModel.countDocuments({
            registrationStatus: 'approved',
            createdAt: {
              $gte: segmentStart.toDate(),
              $lte: segmentEnd.toDate(),
            },
          })
        }
        break

      case TypeSummaryEnum.APPOINTMENT:
        // Thống kê số lượng cuộc hẹn theo createdAt
        currentTotal = await this.appointmentModel.countDocuments({
          createdAt: {
            $gte: currentStart.toDate(),
            $lte: currentEnd.toDate(),
          },
        })

        previousTotal = await this.appointmentModel.countDocuments({
          createdAt: {
            $gte: previousStart.toDate(),
            $lte: previousEnd.toDate(),
          },
        })

        // Tính theo 4 phân đoạn
        for (let i = 0; i < 4; i++) {
          const segmentStart = currentStart.clone().add(i * daysPerSegment, 'days')
          const segmentEnd =
            i === 3
              ? currentEnd.clone()
              : segmentStart
                  .clone()
                  .add(daysPerSegment - 1, 'days')
                  .endOf('day')

          seriesData[i] = await this.appointmentModel.countDocuments({
            createdAt: {
              $gte: segmentStart.toDate(),
              $lte: segmentEnd.toDate(),
            },
          })
        }
        break

      case TypeSummaryEnum.REVENUE:
        // Thống kê doanh thu từ các đơn hàng đã hoàn thành theo createdAt
        const currentRevenue = await this.orderMappingModel.aggregate([
          {
            $match: {
              status: 'completed',
              createdAt: {
                $gte: currentStart.toDate(),
                $lte: currentEnd.toDate(),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ])

        const previousRevenue = await this.orderMappingModel.aggregate([
          {
            $match: {
              status: 'completed',
              createdAt: {
                $gte: previousStart.toDate(),
                $lte: previousEnd.toDate(),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ])

        currentTotal = currentRevenue[0]?.total || 0
        previousTotal = previousRevenue[0]?.total || 0

        // Tính doanh thu theo 4 phân đoạn
        for (let i = 0; i < 4; i++) {
          const segmentStart = currentStart.clone().add(i * daysPerSegment, 'days')
          const segmentEnd =
            i === 3
              ? currentEnd.clone()
              : segmentStart
                  .clone()
                  .add(daysPerSegment - 1, 'days')
                  .endOf('day')

          const segmentRevenue = await this.orderMappingModel.aggregate([
            {
              $match: {
                status: 'completed',
                createdAt: {
                  $gte: segmentStart.toDate(),
                  $lte: segmentEnd.toDate(),
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
              },
            },
          ])

          seriesData[i] = segmentRevenue[0]?.total || 0
        }
        break

      default:
        throw new Error('Invalid summary type')
    }

    // Tính phần trăm thay đổi
    let percent = 0
    if (previousTotal > 0) {
      percent = (currentTotal - previousTotal) / previousTotal
    } else if (currentTotal > 0) {
      percent = 1 // Tăng 100% nếu kỳ trước = 0 và kỳ này > 0
    }

    return {
      percent: Number(percent.toFixed(2)),
      total: currentTotal,
      series: seriesData,
    }
  }

  async topDoctors(dto: TopDoctorsRequestDto): Promise<TopDoctorItemDto[]> {
    const { startDate, endDate, limit } = dto
    // 1. Lấy danh sách bác sĩ đã duyệt
    const doctors = await this.doctorModel
      .find({ registrationStatus: 'approved' })
      .populate('specialty')
      .lean()

    // 2. Lấy thống kê appointment theo doctor trong time range
    const appointments = await this.appointmentModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: '$doctor',
          totalAppointments: { $sum: 1 },
          patients: { $addToSet: '$patient' },
        },
      },
    ])

    // 3. Lấy revenue theo doctor
    const revenues = await this.orderMappingModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          status: 'completed',
          doctorId: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$doctorId',
          revenue: { $sum: '$amount' },
        },
      },
    ])

    // 4. Map và tổng hợp dữ liệu
    const doctorStats: TopDoctorItemDto[] = doctors.map(doc => {
      const app = appointments.find(a => a._id?.toString() === doc._id.toString())
      const rev = revenues.find(r => r._id === doc.id)
      // Lấy specialty name đầu tiên (nếu có)
      let specialtyName = ''
      if (Array.isArray(doc.specialty) && doc.specialty.length > 0) {
        const sp = doc.specialty[0]
        if (typeof sp === 'object' && sp !== null && 'name' in sp) {
          specialtyName = String(sp.name)
        }
      }
      return {
        id: doc.id,
        name: doc.fullName,
        avatar: doc.avatarUrl || null,
        specialty: specialtyName,
        experience: doc.experienceYears,
        rating: doc.avgScore,
        totalReviews: Array.isArray(doc.ratingDetails) ? doc.ratingDetails.length : 0,
        totalPatients: app ? app.patients.length : 0,
        totalAppointments: app ? app.totalAppointments : 0,
        revenue: rev ? rev.revenue : 0,
        status: 'active', // TODO: logic xác định trạng thái hoạt động
      }
    })
    // 5. Sắp xếp theo ranking logic
    doctorStats.sort(
      (a, b) =>
        b.rating - a.rating ||
        b.totalPatients - a.totalPatients ||
        b.revenue - a.revenue ||
        b.totalAppointments - a.totalAppointments,
    )
    return doctorStats.slice(0, limit)
  }

  async appointmentStatusSummary(
    dto: AppointmentStatusSummaryRequestDto,
  ): Promise<AppointmentStatusSummaryItemDto[]> {
    const { startDate, endDate } = dto
    const statuses = Object.keys(APPOINTMENT_STATUS_MAPPING)
    const match = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }
    // Đếm số lượng theo từng status
    const agg = await this.appointmentModel.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    // Map kết quả ra đủ 4 trạng thái
    return statuses.map(status => {
      const found = agg.find(i => i._id === status)
      return {
        status,
        statusVn: APPOINTMENT_STATUS_MAPPING[status as keyof typeof APPOINTMENT_STATUS_MAPPING],
        count: found ? found.count : 0,
      }
    })
  }

  async appointmentBySpecialty(
    dto: AppointmentBySpecialtyRequestDto,
  ): Promise<AppointmentBySpecialtyYearDto[] | AppointmentBySpecialtyRangeResponseDto> {
    const { years, months, startDate, endDate } = dto
    // --- Mode RANGE ---
    if (startDate && endDate) {
      // Tính các tháng trong range
      const start = moment(startDate).startOf('month')
      const end = moment(endDate).endOf('month')
      const categories: string[] = []
      const monthList: { year: number; month: number; label: string }[] = []
      const cur = start.clone()
      while (cur.isSameOrBefore(end)) {
        categories.push(`Tháng ${cur.month() + 1}`)
        monthList.push({
          year: cur.year(),
          month: cur.month() + 1,
          label: `Tháng ${cur.month() + 1}`,
        })
        cur.add(1, 'month')
      }
      // Lấy tất cả lịch hẹn trong range, populate specialty
      const appointments = await this.appointmentModel
        .find({
          date: { $gte: start.format('YYYY-MM-DD'), $lte: end.format('YYYY-MM-DD') },
        })
        .populate('specialty', 'name')
        .lean()
      // Gom nhóm theo năm
      const yearMap: Record<string, Record<string, number[]>> = {}
      for (const { year, month } of monthList) {
        // Lọc lịch hẹn của tháng này
        const monthAppointments = appointments.filter(a => {
          const d = String(a.date)
          return d.startsWith(`${year}-${month.toString().padStart(2, '0')}`)
        })
        // Gom nhóm theo chuyên khoa
        const specialtyMap: Record<string, number[]> = {}
        for (const appt of monthAppointments) {
          let specialtyName = 'Khác'
          if (appt.specialty && typeof appt.specialty === 'object' && 'name' in appt.specialty) {
            specialtyName = String(appt.specialty.name)
          }
          if (!specialtyMap[specialtyName])
            specialtyMap[specialtyName] = Array(categories.length).fill(0)
          // Xác định index tháng
          const idx = monthList.findIndex(m => m.year === year && m.month === month)
          if (idx >= 0) specialtyMap[specialtyName][idx]++
        }
        // Merge vào yearMap
        const yKey = String(year)
        if (!yearMap[yKey]) yearMap[yKey] = {}
        for (const [name, arr] of Object.entries(specialtyMap)) {
          if (!yearMap[yKey][name]) yearMap[yKey][name] = Array(categories.length).fill(0)
          for (let i = 0; i < arr.length; i++) {
            yearMap[yKey][name][i] += arr[i]
          }
        }
      }
      // Build series
      const series: AppointmentBySpecialtyRangeSeriesDto[] = Object.entries(yearMap).map(
        ([year, spMap]) => ({
          year,
          series: Object.entries(spMap).map(([name, data]) => ({ name, data })),
        }),
      )
      return { categories, series }
    }
    // --- Mode YEAR/MONTH ---
    if (years && years.length > 0) {
      // Nếu có months: chỉ trả về các tháng đó, monthly.length = months.length
      // Nếu không: monthly.length = 12
      const start = new Date(`${Math.min(...years)}-01-01T00:00:00.000Z`)
      const end = new Date(`${Math.max(...years)}-12-31T23:59:59.999Z`)
      const appointments = await this.appointmentModel
        .find({
          date: { $gte: start.toISOString().slice(0, 10), $lte: end.toISOString().slice(0, 10) },
        })
        .populate('specialty', 'name')
        .lean()
      const result: AppointmentBySpecialtyYearDto[] = []
      for (const year of years) {
        const yearAppointments = appointments.filter(a => String(a.date).startsWith(String(year)))
        const specialtyMap: Record<string, { name: string; monthly: number[] }> = {}
        for (const appt of yearAppointments) {
          let specialtyName = 'Khác'
          if (appt.specialty && typeof appt.specialty === 'object' && 'name' in appt.specialty) {
            specialtyName = String(appt.specialty.name)
          }
          // months: chỉ lấy các tháng chỉ định, không có thì lấy đủ 12 tháng
          const monthArr =
            months && months.length > 0 ? months : Array.from({ length: 12 }, (_, i) => i + 1)
          if (!specialtyMap[specialtyName])
            specialtyMap[specialtyName] = {
              name: specialtyName,
              monthly: Array(monthArr.length).fill(0),
            }
          // Tính tháng (1-12)
          const month = Number(String(appt.date).slice(5, 7))
          const idx = monthArr.indexOf(month)
          if (idx >= 0) specialtyMap[specialtyName].monthly[idx]++
        }
        // Sắp xếp chuyên khoa theo tổng số lịch hẹn giảm dần
        const specialties = Object.values(specialtyMap).sort(
          (a, b) => b.monthly.reduce((s, n) => s + n, 0) - a.monthly.reduce((s, n) => s + n, 0),
        )
        result.push({ year, specialties })
      }
      return result
    }
    // Nếu không truyền gì hợp lệ
    throw new Error('Thiếu tham số thống kê')
  }
}
