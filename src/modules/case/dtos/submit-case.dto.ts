import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsObject, IsOptional } from 'class-validator'
import { CaseAction } from '../enum/case-action.enum'

export class SubmitCaseDto {
  @ApiProperty({ description: 'ID của case (bệnh án)', required: false })
  @IsOptional()
  @IsMongoId({ message: 'case_id không hợp lệ' })
  case_id?: string

  @ApiProperty({ description: 'ID chuyên khoa', required: false })
  @IsOptional()
  @IsMongoId({ message: 'specialty không hợp lệ' })
  specialty?: string

  @ApiProperty({
    required: false,
    description: 'ID lịch hẹn được chọn (appointment), gửi khi đã tạo lịch',
  })
  @IsOptional()
  @IsMongoId({ message: 'appointment_id không hợp lệ' })
  appointment_id?: string

  @ApiProperty({
    required: false,
    description: 'Dữ liệu form triệu chứng và câu hỏi tư vấn',
    example: {
      symptoms: 'Đau đầu 3 ngày',
      questions: [
        { question: 'Có tiền sử cao huyết áp?', answer: 'Không' },
        { question: 'Có đang căng thẳng không?', answer: 'Có' },
      ],
      note: 'Bệnh nhân có biểu hiện nhẹ, nên theo dõi thêm',
    },
  })
  @IsOptional()
  @IsObject({ message: 'medical_form phải là object' })
  medical_form?: Record<string, any>

  @ApiProperty({
    description: 'Hành động xử lý case',
    enum: CaseAction,
  })
  @IsEnum(CaseAction, { message: 'action phải là một trong: create, save, submit, sendback' })
  action!: CaseAction
}
