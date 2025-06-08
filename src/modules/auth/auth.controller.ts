import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { UsersService } from '../user-service/user.service'
import { AuthService } from './auth.service'
import { ForgotPasswordDto } from './dtos/forgot-password.dto'
import { LoginDto } from './dtos/login.dto'
import { RegisterUserDto } from './dtos/register-user.dto'
import { ResetPasswordDto } from './dtos/reset-password.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { JwtPayload } from './interfaces/jwt-payload.interface'

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Login and get JWT token' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<unknown> {
    return this.authService.login(loginDto)
  }

  @ApiOperation({ summary: 'Register new patient account' })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto): Promise<unknown> {
    return this.authService.register(dto)
  }

  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<unknown> {
    return this.authService.forgotPassword(dto)
  }

  @ApiOperation({ summary: 'Đặt lại mật khẩu với OTP' })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<unknown> {
    return this.authService.resetPassword(dto)
  }

  @ApiOperation({ summary: 'Logout user' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ message: string }> {
    return { message: 'Logout successful' }
  }

  @ApiOperation({ summary: 'Lấy thông tin profile user từ token' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin profile user hiện tại',
    schema: {
      example: {
        message: 'Lấy thông tin profile thành công',
        data: {
          _id: '664b1e2f2f8b2c001e7e7e7d',
          username: 'user01',
          fullName: 'Nguyễn Văn A',
          email: 'a@gmail.com',
          phoneNumber: '0987654321',
          role: 'PATIENT',
          // ... các field khác tuỳ role
        },
        status: 200,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ hoặc thiếu Bearer Token' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(
    @Req() req: Request & { user: JwtPayload },
  ): Promise<{ message: string; data: unknown; status: number }> {
    const { user } = req
    if (!user) return { message: 'Token không hợp lệ', data: null, status: 401 }
    let profile = null
    if (user.role === 'DOCTOR') {
      profile = await this.usersService.getDoctorById(user.userId)
    } else if (user.role === 'PATIENT') {
      profile = await this.usersService.getPatientById(user.userId)
    } else if (user.role === 'EMPLOYEE') {
      profile = await this.usersService.getEmployeeById(user.userId)
    } else if (user.role === 'ADMIN') {
      // Nếu có model admin riêng, có thể lấy thêm thông tin admin ở đây
      profile = { userId: user.userId, username: user.username, role: user.role }
    }
    return {
      message: 'Lấy thông tin profile thành công',
      data: profile,
      status: 200,
    }
  }
}
