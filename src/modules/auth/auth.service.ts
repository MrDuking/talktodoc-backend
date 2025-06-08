import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { EmailOtp } from '../otp_service/schemas/email-otp.schema'
import { StringeeService } from '../stringee-service/stringee.service'
import { Admin, AdminDocument } from '../user-service/schemas/admin.schema'
import { Doctor, DoctorDocument } from '../user-service/schemas/doctor.schema'
import { Employee, EmployeeDocument } from '../user-service/schemas/employee.schema'
import { Patient, PatientDocument } from '../user-service/schemas/patient.schema'
import { ForgotPasswordDto } from './dtos/forgot-password.dto'
import { LoginDto } from './dtos/login.dto'
import { RegisterUserDto } from './dtos/register-user.dto'
import { ResetPasswordDto } from './dtos/reset-password.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(EmailOtp.name) private otpModel: Model<EmailOtp>,
    private readonly jwtService: JwtService,
    private readonly stringeeService: StringeeService,
  ) {}

  async validateUser(identifier: string, password: string): Promise<any> {
    const user = await this.findUserByIdentifier(identifier)
    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại, vui lòng kiểm tra lại.')

    // const isMatch = await bcrypt.compare(password, user.password)
    // if (!isMatch) throw new UnauthorizedException("Nhập sai mật khẩu, vui lòng kiểm tra lại.")
    if (user.password !== password) {
      throw new UnauthorizedException('Nhập sai mật khẩu, vui lòng kiểm tra lại.')
    }
    const { password: _, ...result } = user
    return result
  }

  async findUserByIdentifier(identifier: string): Promise<any> {
    const matchFields = {
      $or: [{ username: identifier }, { email: identifier }, { phoneNumber: identifier }],
    }

    // ADMIN không cần populate
    const admin = await this.adminModel.findOne(matchFields).lean()
    if (admin) return { ...admin, role: 'ADMIN' }

    // Define common populate options
    const populateFields = [
      { path: 'specialty', select: 'name', options: { lean: true } },
      { path: 'rank', select: 'name', options: { lean: true } },
      { path: 'hospital', select: 'name', options: { lean: true } },
    ]

    const attachDefaults = (user: any, role: string) => ({
      ...user,
      specialty: user.specialty ?? { name: 'Không xác định' },
      rank: user.rank ?? { name: 'Không xác định' },
      hospital: user.hospital ?? { name: 'Không xác định' },
      role,
    })

    const doctor = await this.doctorModel
      .findOne(matchFields)
      .select('+password')
      .populate(populateFields)
      .lean()
      .exec()
    if (doctor) return attachDefaults(doctor, 'DOCTOR')

    const employee = await this.employeeModel
      .findOne(matchFields)
      .select('+password')
      .populate(populateFields)
      .lean()
      .exec()
    if (employee) return attachDefaults(employee, 'EMPLOYEE')

    const patient = await this.patientModel.findOne(matchFields).select('+password').lean().exec()
    if (patient) return attachDefaults(patient, 'PATIENT')

    return null
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; stringeeAccessToken: string; userProfile: unknown }> {
    const user = await this.validateUser(loginDto.identifier, loginDto.password)
    const payload = { username: user.username, sub: user._id, role: user.role }
    const appAccessToken = this.jwtService.sign(payload)
    const stringeeAccessToken = this.stringeeService.generateClientAccessToken(user._id.toString())
    // Trả về userProfile là object user đã validate (không lấy lại từ DB)
    return {
      accessToken: appAccessToken,
      stringeeAccessToken: stringeeAccessToken,
      userProfile: user,
    }
  }

  async register(dto: RegisterUserDto): Promise<any> {
    const { username, email, phoneNumber, password } = dto

    const existing = await this.patientModel.findOne({
      $or: [{ username }, { email }, { phoneNumber }],
    })
    if (existing) throw new UnauthorizedException('Tài khoản đã tồn tại, vui lòng kiểm tra lại.')

    // Kiểm tra OTP email đã được verify chưa
    const otpVerified = await this.otpModel.findOne({ email, isVerified: true })
    if (!otpVerified) {
      throw new UnauthorizedException('Email chưa được xác thực, vui lòng kiểm tra lại.')
    }

    // const hashedPassword = await bcrypt.hash(password, 10) ma hoa
    const newUser = new this.patientModel({
      username,
      email,
      phoneNumber,
      password,
      // password: hashedPassword
    })

    return newUser.save()
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = dto

    // Kiểm tra người dùng tồn tại
    const user = await this.findUserByEmail(email)
    if (!user) {
      throw new NotFoundException('Email không tồn tại trong hệ thống')
    }

    // OTP sẽ được gửi thông qua OTP Service, không cần thực hiện gì thêm ở đây
    return { message: 'Vui lòng kiểm tra email để nhận mã OTP đặt lại mật khẩu' }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, otp, newPassword } = dto

    // Kiểm tra xem OTP có hợp lệ không
    const otpRecord = await this.otpModel.findOne({ email, otp })
    if (!otpRecord) {
      throw new BadRequestException('Mã OTP không hợp lệ')
    }

    if (!otpRecord.isVerified) {
      throw new BadRequestException('Mã OTP chưa được xác thực')
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('Mã OTP đã hết hạn')
    }

    // Tìm người dùng và cập nhật mật khẩu
    const user = await this.findUserByEmail(email)
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản với email này')
    }

    // Cập nhật mật khẩu dựa trên loại tài khoản
    if (user.role === 'ADMIN') {
      await this.adminModel.findByIdAndUpdate(user._id, { password: newPassword })
    } else if (user.role === 'DOCTOR') {
      await this.doctorModel.findByIdAndUpdate(user._id, { password: newPassword })
    } else if (user.role === 'EMPLOYEE') {
      await this.employeeModel.findByIdAndUpdate(user._id, { password: newPassword })
    } else if (user.role === 'PATIENT') {
      await this.patientModel.findByIdAndUpdate(user._id, { password: newPassword })
    } else {
      throw new BadRequestException('Loại tài khoản không hợp lệ')
    }

    // Đánh dấu OTP đã sử dụng (nên xóa OTP sau khi sử dụng)
    await this.otpModel.deleteOne({ email, otp })

    return { message: 'Đặt lại mật khẩu thành công, vui lòng đăng nhập với mật khẩu mới' }
  }

  async findUserByEmail(email: string): Promise<any> {
    // Tìm kiếm trong tất cả các loại tài khoản
    const admin = await this.adminModel.findOne({ email }).lean()
    if (admin) return { ...admin, role: 'ADMIN' }

    const doctor = await this.doctorModel.findOne({ email }).lean()
    if (doctor) return { ...doctor, role: 'DOCTOR' }

    const employee = await this.employeeModel.findOne({ email }).lean()
    if (employee) return { ...employee, role: 'EMPLOYEE' }

    const patient = await this.patientModel.findOne({ email }).lean()
    if (patient) return { ...patient, role: 'PATIENT' }

    return null
  }
}
