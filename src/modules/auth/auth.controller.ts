import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { ForgotPasswordDto } from './dtos/forgot-password.dto'
import { LoginDto } from './dtos/login.dto'
import { RegisterUserDto } from './dtos/register-user.dto'
import { ResetPasswordDto } from './dtos/reset-password.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login and get JWT token' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @ApiOperation({ summary: 'Register new patient account' })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto)
  }

  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  @ApiOperation({ summary: 'Đặt lại mật khẩu với OTP' })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  @ApiOperation({ summary: 'Logout user' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Logout successful' }
  }
}
