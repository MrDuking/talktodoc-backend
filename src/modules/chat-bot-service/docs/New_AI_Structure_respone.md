Ok, để bạn có thể thêm thẳng vào Cursor và auto-generate API, mình sẽ viết requirement hoàn chỉnh theo format .md như sau:

⸻

📌 Requirement: JSON API Lịch Hẹn/Tái Khám dùng field hiện có (reuse backend fields)

🎯 Mục tiêu

Tạo một API cho phép chatbot gọi và nhận về JSON content để hiển thị thông tin lịch hẹn hoặc tái khám cho bệnh nhân. API tái sử dụng Y NGUYÊN các tên field hiện có trong backend (Mongoose schemas) để đồng bộ dữ liệu, tránh mapping rườm rà giữa FE/BE.

⸻

⚙️ Chi tiết kỹ thuật

1) Endpoint
- Method: GET
- URL: `/appointments/follow-up`
- Query params:
  - `patient` (string, required): ObjectId bệnh nhân (reuse field `patient` của `Appointment`)
  - `limit` (number, optional, default 1): Số lịch hẹn gần nhất cần trả về

2) Response JSON (Reuse field names from existing schemas)

2.1. Có lịch hẹn tái khám (follow up available)
```json
{
  "follow_up": true,
  "appointments": [
    {
      "appointmentId": "APT-20240901-0001",
      "patient": "66f0d2b1b8c8a13a5d0c1e11",            
      "doctor": "66f0d2b1b8c8a13a5d0c1e22",             
      "specialty": "66f0d2b1b8c8a13a5d0c1e33",           
      "date": "2025-09-10",                               
      "slot": "09:30",                                    
      "timezone": "Asia/Ho_Chi_Minh",                     
      "status": "CONFIRMED",                              
      "reason": "Tái khám kiểm tra đường huyết",          
      "doctorNote": "Theo dõi đường huyết sau 2 tuần",
      "payment": {
        "platformFee": 0,
        "doctorFee": 500000,
        "discount": 0,
        "total": 500000,
        "status": "UNPAID",
        "paymentMethod": ""
      },
      "createdAt": "2025-09-01T03:00:00.000Z",
      "confirmedAt": "2025-09-01T04:00:00.000Z",
      "completedAt": null,
      "cancelledAt": null
    }
  ],
  "doctorInfo": {
    "id": "DR123456",                                     
    "_id": "66f0d2b1b8c8a13a5d0c1e22",
    "name": "BS. Nguyễn Văn A",                            
    "specialty": ["66f0d2b1b8c8a13a5d0c1e33"],              
    "hospital": "66f0d2b1b8c8a13a5d0c1e44"
  },
  "patientInfo": {
    "_id": "66f0d2b1b8c8a13a5d0c1e11",
    "name": "Nguyễn Văn B"
  }
}
```

Ghi chú:
- Các field trong `appointments[]` giữ nguyên tên theo `Appointment` schema: `appointmentId`, `patient`, `doctor`, `specialty`, `date`, `slot`, `timezone`, `status`, `payment`, `createdAt`, `confirmedAt`, `completedAt`, `cancelledAt`, `reason`, `doctorNote`.
- `doctorInfo` và `patientInfo` là optional enrichment (nếu FE cần hiển thị thêm), có thể lấy từ `Doctor` và `Patient` schemas. Giữ nguyên `Doctor.id` (ví dụ `DRxxxxxx`).

2.2. Không có lịch hẹn tái khám
```json
{
  "follow_up": false,
  "appointments": []
}
```


⸻

3) Logic xử lý (BE)
- Input `patient` là ObjectId, dùng để query `Appointment` theo `patient` và `status` thuộc tập {`CONFIRMED`, `PENDING`, `COMPLETED`} tùy tiêu chí tái khám.
- Xác định tái khám: dựa vào `reason`/`doctorNote` hoặc business rule (ví dụ: `COMPLETED` cách đây >= 14 ngày → đề xuất lịch mới cùng `doctor`).
- Trả về tối đa `limit` lịch hẹn theo `createdAt` hoặc `date` gần nhất.
- Trả thêm `doctorInfo` (từ `Doctor`) và `patientInfo` (từ `Patient`) nếu cần hiển thị tên, chuyên khoa.

⸻

4) Code mẫu (NestJS) – Reuse field names

```ts
import { Controller, Get, Query } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Appointment } from '../../appointments_service/schemas/appointment.schema'
import { Doctor } from '../../user-service/schemas/doctor.schema'

@Controller('appointments')
export class AppointmentsController {
  constructor(
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
  ) {}

  @Get('follow-up')
  async getFollowUp(
    @Query('patient') patient: string,
    @Query('limit') limit = 1,
  ) {
    if (!patient || !Types.ObjectId.isValid(patient)) {
      return { follow_up: false, appointments: [] }
    }

    const query = { patient: new Types.ObjectId(patient) }
    const appointments = await this.appointmentModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean()

    if (!appointments.length) {
      return { follow_up: false, appointments: [] }
    }

    const first = appointments[0]
    const doctorInfo = first.doctor
      ? await this.doctorModel.findById(first.doctor).lean()
      : null

    return {
      follow_up: true,
      appointments,
      doctorInfo: doctorInfo
        ? {
            id: doctorInfo.id,     // DRxxxxxx
            _id: doctorInfo._id,
            name: doctorInfo.name,
            specialty: doctorInfo.specialty,
            hospital: doctorInfo.hospital,
          }
        : null,
    }
  }
}
```


⸻

5) Khả năng mở rộng
- Filter theo `specialty`, `doctor`, `status` (reuse fields)
- API POST `/appointments/reschedule` – payload reuse fields: `appointmentId`, `date`, `slot`, `timezone`
- Hỗ trợ phân trang: `page`, `limit` cho danh sách lịch hẹn
- Chuẩn hóa follow-up rule qua config (VD: số ngày sau `COMPLETED`)

⸻

Bạn có muốn mình viết thêm schema UI JSON cho chatbot (ví dụ dạng card hiển thị + button đặt lịch lại) để FE render trực tiếp không?