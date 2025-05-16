import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class SendContactEmailDto {
  @ApiProperty({ example: 'benhnhan@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'Nguyen huu Duk' })
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: 'Tôi cần hỗ trợ về kết quả khám.' })
  @IsNotEmpty()
  message!: string
}
