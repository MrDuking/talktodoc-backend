import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email đăng ký tài khoản',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string

  @ApiProperty({
    example: '123456',
    description: 'Mã OTP đã được gửi đến email',
  })
  @IsString({ message: 'OTP phải là chuỗi ký tự' })
  otp!: string

  @ApiProperty({
    example: 'newPassword123',
    description: 'Mật khẩu mới',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  newPassword!: string
}
