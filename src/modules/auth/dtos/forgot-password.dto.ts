import { ApiProperty } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email đăng ký tài khoản cần khôi phục mật khẩu',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string
}
