import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { FilterQuery, Model } from 'mongoose'
import { MailService } from '../mail/mail.service'
import {
  CreateDoctorDto,
  CreateEmployeeDto,
  CreatePatientDto,
  SetAvailabilityDto,
  UpdateDoctorDto,
  UpdateEmployeeDto,
  UpdatePatientDto,
} from './dtos/index'
import { SubmitRatingDto } from './dtos/submit-rating.dto'
import { Doctor, DoctorDocument, DoctorRegistrationStatus } from './schemas/doctor.schema'
import { Employee, EmployeeDocument } from './schemas/employee.schema'
import { Patient, PatientDocument } from './schemas/patient.schema'

type SortOrder = 'asc' | 'desc'

interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    private readonly mailService: MailService,
  ) {}

  // ===================== EMPLOYEE =====================
  async getAllEmployees(): Promise<Employee[]> {
    return this.employeeModel.find().populate('specialty').exec()
  }

  async getEmployeeById(id: string): Promise<Employee> {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid employee ID format')
    const employee = await this.employeeModel.findById(id).populate('specialty').exec()
    console.log('employee', employee)
    if (!employee) throw new NotFoundException('Employee not found')
    return employee
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const employee = new this.employeeModel(createEmployeeDto)
    return employee.save()
  }

  async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid employee ID format')
    const updated = await this.employeeModel
      .findByIdAndUpdate(id, updateEmployeeDto, { new: true, runValidators: true })
      .populate('specialty')
      .exec()
    if (!updated) throw new NotFoundException('Employee not found')
    return updated
  }

  async deleteEmployee(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid employee ID format')
    const result = await this.employeeModel.findByIdAndDelete(id).exec()
    if (!result) throw new NotFoundException('Employee not found')
  }

  // ===================== DOCTOR =====================
  async getAllDoctors(): Promise<Doctor[]> {
    return this.doctorModel
      .find()
      .populate('specialty')
      .populate('rank')
      .populate('hospital')
      .exec()
  }

  async getDoctorById(id: string): Promise<Doctor> {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid doctor ID format')
    const doctor = await this.doctorModel
      .findById(id)
      .populate('specialty')
      .populate('rank')
      .populate('hospital')
      .exec()
    if (!doctor) throw new NotFoundException('Doctor not found')
    return doctor
  }

  //   async createDoctor(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
  //     const doctor = new this.doctorModel({
  //         ...createDoctorDto,
  //         registrationStatus: createDoctorDto.registrationStatus ?? DoctorRegistrationStatus.PENDING,
  //       })
  //           return doctor.save()
  //   }
  async createDoctor(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const doctor = new this.doctorModel({
      ...createDoctorDto,
      registrationStatus: createDoctorDto.registrationStatus ?? DoctorRegistrationStatus.PENDING,
    })

    const savedDoctor = await doctor.save()

    if (savedDoctor.registrationStatus === DoctorRegistrationStatus.PENDING) {
      await this.mailService.sendTemplateMail({
        to: savedDoctor.email,
        subject: 'Yêu cầu đăng ký bác sĩ của bạn đã được ghi nhận',
        template: 'doctor-request',
        variables: {
          fullName: savedDoctor.fullName,
          phoneNumber: savedDoctor.phoneNumber,
          email: savedDoctor.email,
        },
      })

      const employees = await this.employeeModel.find({ isActive: true }).exec()

      await Promise.all(
        employees.map(emp =>
          this.mailService.sendTemplateMail({
            to: emp.email,
            subject: 'Thông báo: Bác sĩ mới đăng ký',
            template: 'new-doctor-request',
            variables: {
              fullName: savedDoctor.fullName,
              phoneNumber: savedDoctor.phoneNumber,
              email: savedDoctor.email,
              submittedAt: new Date().toLocaleString(),
            },
          }),
        ),
      )
    }

    return savedDoctor
  }

  async updateDoctor(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID bác sĩ không hợp lệ')
    }

    // Tách approve_request khỏi DTO
    const { approve_request, ...rest } = updateDoctorDto as any

    // Nếu có yêu cầu duyệt thì set registrationStatus
    if (approve_request === true) {
      rest.registrationStatus = DoctorRegistrationStatus.APPROVED
    }

    const updated = await this.doctorModel
      .findByIdAndUpdate(id, rest, { new: true, runValidators: true })
      .exec()

    if (!updated) throw new NotFoundException('Không tìm thấy bác sĩ')

    // Nếu vừa duyệt thì gửi email
    if (approve_request === true) {
      await this.mailService.sendTemplateMail({
        to: updated.email,
        subject: 'Hồ sơ bác sĩ của bạn đã được phê duyệt',
        template: 'doctor-approval-result',
        variables: {
          fullName: updated.fullName,
          status: 'Đã được PHÊ DUYỆT',
        },
      })
    }

    // Populate lại để trả về đầy đủ
    const result = await this.doctorModel
      .findById(updated._id)
      .populate('specialty')
      .populate('rank')
      .populate('hospital')
      .exec()

    if (!result) throw new NotFoundException('Không tìm thấy bác sĩ')
    return result
  }

  async deleteDoctor(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid doctor ID format')
    const result = await this.doctorModel.findByIdAndDelete(id).exec()
    if (!result) throw new NotFoundException('Doctor not found')
  }

  async migrateDefaultRegistrationStatus(): Promise<void> {
    await this.doctorModel.updateMany(
      { registrationStatus: { $exists: true } },
      { $set: { registrationStatus: 'approved' } },
    )
  }

  async submitDoctorRating(id: string, dto: SubmitRatingDto) {
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(dto.appointmentId)
    ) {
      throw new BadRequestException('ID không hợp lệ')
    }

    const doctor = await this.doctorModel.findById(id)
    if (!doctor) throw new NotFoundException('Không tìm thấy bác sĩ')

    const alreadyRated = doctor.ratingDetails.some(
      rating => rating.appointmentId?.toString() === dto.appointmentId,
    )

    if (alreadyRated) {
      throw new BadRequestException('Bạn đã đánh giá lịch hẹn này rồi')
    }

    doctor.ratingDetails.push({
      ratingScore: dto.ratingScore,
      description: dto.description,
      appointmentId: new mongoose.Types.ObjectId(dto.appointmentId),
    })

    const total = doctor.ratingDetails.reduce((sum, cur) => sum + cur.ratingScore, 0)
    doctor.avgScore = Math.round((total / doctor.ratingDetails.length) * 10) / 10

    await doctor.save()

    return {
      message: 'Đánh giá đã được ghi nhận',
      avgScore: doctor.avgScore,
      totalRatings: doctor.ratingDetails.length,
    }
  }

  async setDoctorAvailability(id: string, dto: SetAvailabilityDto): Promise<Doctor> {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID bác sĩ không hợp lệ')

    const doctor = await this.doctorModel.findById(id)
    if (!doctor) throw new NotFoundException('Không tìm thấy bác sĩ')

    // Validate và sắp xếp lịch làm việc
    const sortedAvailability = dto.availability
      .map(day => ({
        dayOfWeek: day.dayOfWeek,
        timeSlot: day.timeSlot
          .sort((a, b) => a.index - b.index)
          .map(slot => ({
            index: slot.index,
            timeStart: slot.timeStart,
            timeEnd: slot.timeEnd,
          })),
      }))
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)

    doctor.availability = sortedAvailability
    await doctor.save()

    return doctor
  }
  // ===================== PATIENT =====================
  async getAllPatients(): Promise<Patient[]> {
    return this.patientModel.find().exec()
  }

  async getPatientById(_id: string): Promise<Patient> {
    console.log('id', _id)
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('Invalid patient ID format')
    const patient = await this.patientModel.findById(_id).exec()
    console.log('patient', patient)
    if (!patient) throw new NotFoundException('Patient not found')
    return patient
  }

  async createPatient(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = new this.patientModel(createPatientDto)
    return patient.save()
  }

  async updatePatient(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid patient ID format')
    const updated = await this.patientModel
      .findByIdAndUpdate(id, updatePatientDto, { new: true, runValidators: true })
      .exec()
    if (!updated) throw new NotFoundException('Patient not found')
    return updated
  }

  async deletePatient(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid patient ID format')
    const result = await this.patientModel.findByIdAndDelete(id).exec()
    if (!result) throw new NotFoundException('Patient not found')
  }

  async getPatientByCode(code: string): Promise<Patient> {
    const patient = await this.patientModel.findOne({ id: code }).exec()
    if (!patient) throw new NotFoundException('Patient not found')
    return patient
  }

  // ===================== SEARCH =====================
  async searchEmployees(
    query: string,
    page: number = 1,
    limit: number = 10,
    sortField: string = 'name',
    sortOrder: SortOrder = 'asc',
  ): Promise<PaginatedResult<Employee>> {
    const filter: FilterQuery<EmployeeDocument> = {}

    if (query) {
      filter.$or = [
        { id: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { position: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } },
      ]
    }

    const total = await this.employeeModel.countDocuments(filter)
    const employees = await this.employeeModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .populate('specialty')
      .lean()
      .exec()

    return { data: employees, total, page, limit }
  }

  async searchDoctors(
    query: string,
    page: number = 1,
    limit: number = 10,
    sortField: string = 'name',
    sortOrder: SortOrder = 'asc',
  ): Promise<PaginatedResult<Doctor>> {
    const filter: FilterQuery<DoctorDocument> = {}

    if (query) {
      filter.$or = [
        { id: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } },
      ]
    }

    const total = await this.doctorModel.countDocuments(filter)
    const doctors = await this.doctorModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .populate('specialty')
      .populate('rank')
      .populate('hospital')
      .lean()
      .exec()

    return { data: doctors, total, page, limit }
  }

  async searchPatients(
    query: string,
    page: number = 1,
    limit: number = 10,
    sortField: string = 'name',
    sortOrder: SortOrder = 'asc',
  ): Promise<PaginatedResult<Patient>> {
    const filter: FilterQuery<PatientDocument> = {}

    if (query) {
      filter.$or = [
        { id: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } },
      ]
    }

    const total = await this.patientModel.countDocuments(filter)
    const patients = await this.patientModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .lean()
      .exec()

    return { data: patients, total, page, limit }
  }

  // ===================== FIND ONE / MANY =====================
  async findOneUser(userId: string): Promise<Doctor | Patient | Employee | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return null

    const patient = await this.patientModel.findById(userId).lean().exec()
    if (patient) return patient

    const doctor = await this.doctorModel.findById(userId).lean().exec()
    if (doctor) return doctor

    const employee = await this.employeeModel.findById(userId).lean().exec()
    if (employee) return employee

    return null
  }

  async findManyPatientsByIds(ids: string[]): Promise<Patient[]> {
    if (!Array.isArray(ids) || ids.length === 0) return []
    const objectIds = ids
      .filter(id => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id))
    if (objectIds.length === 0) return []
    return this.patientModel
      .find({ _id: { $in: objectIds } })
      .lean()
      .exec()
  }

  async findByEmail(email: string): Promise<Doctor | Patient | Employee | null> {
    return this.patientModel.findOne({ email }).exec()
  }
}
