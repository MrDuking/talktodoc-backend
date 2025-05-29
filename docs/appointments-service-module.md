# Appointments Service Module Documentation

Module quản lý lịch hẹn khám bệnh giữa bệnh nhân và bác sĩ trong hệ thống TalkToDoc.

## Base URL

```
/appointments
```

## Endpoints

### 1. Tạo lịch hẹn

**POST** `/appointments`

Tạo lịch hẹn mới và liên kết với case (bệnh án).

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Request Body

```json
{
  "case_id": "6405f7d2e4b0b7a7c8d9e0f1",
  "specialty": "6405f7d2e4b0b7a7c8d9e0f2",
  "doctor": "6405f7d2e4b0b7a7c8d9e0f3",
  "date": "2025-04-20",
  "slot": "09:00-10:00",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

#### Response Success

```json
{
  "statusCode": 201,
  "message": "Appointment created successfully",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f4",
    "appointmentId": "AP123456",
    "patient": "6405f7d2e4b0b7a7c8d9e0f1",
    "doctor": "6405f7d2e4b0b7a7c8d9e0f3",
    "specialty": "6405f7d2e4b0b7a7c8d9e0f2",
    "date": "2025-04-20",
    "slot": "09:00-10:00",
    "timezone": "Asia/Ho_Chi_Minh",
    "status": "PENDING",
    "createdAt": "2025-01-14T10:30:00.000Z"
  }
}
```

#### Response Error - Trùng lịch

```json
{
  "statusCode": 400,
  "message": "Bác sĩ đã có lịch hẹn vào 2025-04-20 09:00-10:00. Vui lòng chọn thời gian khác.",
  "success": false
}
```

### 2. Lấy danh sách lịch hẹn

**GET** `/appointments`

#### Query Parameters

- `q` (optional): Tìm kiếm theo ID, ngày, trạng thái
- `page` (optional, default: 1): Trang hiện tại
- `limit` (optional, default: 10): Số lượng mỗi trang

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "data": [
      {
        "_id": "6405f7d2e4b0b7a7c8d9e0f4",
        "appointmentId": "AP123456",
        "patient": {
          "_id": "6405f7d2e4b0b7a7c8d9e0f1",
          "fullName": "Nguyễn Văn A",
          "email": "patient@example.com"
        },
        "doctor": {
          "_id": "6405f7d2e4b0b7a7c8d9e0f3",
          "fullName": "BS. Nguyễn Văn B",
          "specialty": {
            "_id": "6405f7d2e4b0b7a7c8d9e0f2",
            "name": "Tim mạch"
          }
        },
        "specialty": {
          "_id": "6405f7d2e4b0b7a7c8d9e0f2",
          "name": "Tim mạch"
        },
        "date": "2025-04-20",
        "slot": "09:00-10:00",
        "status": "CONFIRMED",
        "payment": {
          "platformFee": 20000,
          "doctorFee": 200000,
          "discount": 0,
          "total": 220000,
          "status": "PAID",
          "paymentMethod": "VNPay"
        }
      }
    ]
  }
}
```

### 3. Xem chi tiết lịch hẹn

**GET** `/appointments/:id`

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f4",
    "appointmentId": "AP123456",
    "patient": {
      "_id": "6405f7d2e4b0b7a7c8d9e0f1",
      "fullName": "Nguyễn Văn A",
      "email": "patient@example.com"
    },
    "doctor": {
      "_id": "6405f7d2e4b0b7a7c8d9e0f3",
      "fullName": "BS. Nguyễn Văn B",
      "specialty": {
        "_id": "6405f7d2e4b0b7a7c8d9e0f2",
        "name": "Tim mạch"
      },
      "rank": {
        "_id": "6405f7d2e4b0b7a7c8d9e0f5",
        "name": "Chuyên khoa I",
        "base_price": 200000
      }
    },
    "specialty": {
      "_id": "6405f7d2e4b0b7a7c8d9e0f2",
      "name": "Tim mạch"
    },
    "status": "CONFIRMED",
    "date": "2025-04-20T00:00:00.000Z",
    "slot": "09:00-10:00",
    "timezone": "Asia/Ho_Chi_Minh",
    "booking": {
      "date": "2025-04-20T00:00:00.000Z",
      "slot": "09:00-10:00",
      "timezone": "Asia/Ho_Chi_Minh"
    }
  }
}
```

### 4. Cập nhật lịch hẹn

**PATCH** `/appointments/:id`

#### Request Body

```json
{
  "medicalForm": {
    "symptoms": "Đau ngực, khó thở",
    "pain_level": "Mức độ 7/10"
  },
  "payment": {
    "platformFee": 20000,
    "doctorFee": 200000,
    "total": 220000,
    "status": "PAID",
    "paymentMethod": "VNPay"
  },
  "duration_call": "30 phút",
  "notes": "Bệnh nhân cần theo dõi thêm"
}
```

### 5. Hủy lịch hẹn

**PATCH** `/appointments/:id`

#### Request Body

```json
{
  "status": "CANCELLED",
  "reason": "Bệnh nhân có việc đột xuất"
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Lịch hẹn đã được cập nhật",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f4",
    "status": "CANCELLED",
    "cancelledAt": "2025-01-14T10:30:00.000Z",
    "reason": "Bệnh nhân có việc đột xuất"
  }
}
```

### 6. Bác sĩ xác nhận lịch hẹn

**PATCH** `/appointments/:id/confirm`

**Roles**: DOCTOR

#### Request Body

```json
{
  "note": "Đã xem triệu chứng, sẽ khám kỹ hơn"
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Lịch hẹn đã được xác nhận và email đã được gửi.",
  "success": true
}
```

### 7. Bác sĩ từ chối lịch hẹn

**PATCH** `/appointments/:id/reject`

**Roles**: DOCTOR

#### Request Body

```json
{
  "reason": "Lịch bác sĩ đầy, không thể tiếp nhận"
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Lịch hẹn đã được từ chối và email đã được gửi.",
  "success": true
}
```

### 8. Lấy lịch hẹn theo bác sĩ

**GET** `/appointments/doctor/:doctorId`

#### Query Parameters

- `status` (optional): Lọc theo trạng thái
- `date` (optional): Lọc theo ngày cụ thể (YYYY-MM-DD)
- `from_date` (optional): Lọc từ ngày (YYYY-MM-DD)
- `to_date` (optional): Lọc đến ngày (YYYY-MM-DD)
- `page` (optional, default: 1): Trang hiện tại
- `limit` (optional, default: 10): Số lượng mỗi trang

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "items": [
      {
        "_id": "6405f7d2e4b0b7a7c8d9e0f4",
        "appointmentId": "AP123456",
        "patient": {
          "_id": "6405f7d2e4b0b7a7c8d9e0f1",
          "fullName": "Nguyễn Văn A",
          "email": "patient@example.com",
          "phone": "0987654321"
        },
        "specialty": {
          "_id": "6405f7d2e4b0b7a7c8d9e0f2",
          "name": "Tim mạch"
        },
        "date": "2025-04-20",
        "slot": "09:00-10:00",
        "status": "CONFIRMED"
      }
    ]
  }
}
```

### 9. Migrate trạng thái mặc định

**GET** `/appointments/migrate-specialty`

Chuyển tất cả lịch hẹn về trạng thái PENDING (dùng cho migration).

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Đã migrate status thành công.",
  "success": true
}
```

### 10. Xóa lịch hẹn (Admin)

**DELETE** `/appointments/:id`

**Roles**: ADMIN

#### Response Success

```
HTTP 204 No Content
```

## Schemas

### Appointment Schema

```typescript
{
  _id: ObjectId;
  appointmentId: string;          // Mã lịch hẹn duy nhất (AP123456)
  patient: ObjectId;              // Reference to Patient
  doctor: ObjectId;               // Reference to Doctor
  specialty: ObjectId;            // Reference to Specialty
  date: string;                   // Ngày hẹn (YYYY-MM-DD)
  slot: string;                   // Khung giờ (09:00-10:00)
  timezone: string;               // Múi giờ (Asia/Ho_Chi_Minh)
  medicalForm?: {                 // Form triệu chứng
    symptoms?: string;
    pain_level?: string;
    [key: string]: any;
  };
  status: AppointmentStatus;      // Trạng thái lịch hẹn
  confirmedAt?: Date;             // Thời gian xác nhận
  cancelledAt?: Date;             // Thời gian hủy
  doctorNote?: string;            // Ghi chú của bác sĩ
  reason?: string;                // Lý do hủy/từ chối
  payment?: {                     // Thông tin thanh toán
    platformFee: number;          // Phí nền tảng
    doctorFee: number;            // Phí bác sĩ
    discount: number;             // Giảm giá
    total: number;                // Tổng tiền
    status: PaymentStatus;        // Trạng thái thanh toán
    paymentMethod?: string;       // Phương thức thanh toán
  };
  notes?: string;                 // Ghi chú khác
  duration_call?: string;         // Thời gian cuộc gọi
  createdAt: Date;
  updatedAt: Date;
}
```

### CreateAppointmentDto

```typescript
{
  case_id: string // ID bệnh án (MongoId)
  specialty: string // ID chuyên khoa (MongoId)
  doctor: string // ID bác sĩ (MongoId)
  date: string // Ngày hẹn (YYYY-MM-DD)
  slot: string // Khung giờ
  timezone: string // Múi giờ (default: Asia/Ho_Chi_Minh)
}
```

### UpdateAppointmentDto

```typescript
{
  medicalForm?: {
    symptoms?: string;
    pain_level?: string;
    [key: string]: any;
  };
  doctor?: string;               // ID bác sĩ mới
  date?: string;                 // Ngày hẹn mới
  slot?: string;                 // Khung giờ mới
  payment?: {
    platformFee?: number;
    doctorFee?: number;
    discount?: number;
    total?: number;
    status?: PaymentStatus;
    paymentMethod?: string;
  };
  reason?: string;               // Lý do hủy/thay đổi
  status?: AppointmentStatus;    // Trạng thái mới
  duration_call?: string;        // Thời gian cuộc gọi
  notes?: string;                // Ghi chú
}
```

## Enums

### AppointmentStatus

```typescript
enum AppointmentStatus {
  PENDING = 'PENDING', // Chờ xác nhận
  CONFIRMED = 'CONFIRMED', // Đã xác nhận
  CANCELLED = 'CANCELLED', // Đã hủy
  REJECTED = 'REJECTED', // Bị từ chối
  COMPLETED = 'COMPLETED', // Đã hoàn thành
}
```

### PaymentStatus

```typescript
enum PaymentStatus {
  PAID = 'PAID', // Đã thanh toán
  UNPAID = 'UNPAID', // Chưa thanh toán
}
```

## Business Logic

### Kiểm tra trùng lịch

System sẽ kiểm tra xem bác sĩ đã có lịch hẹn vào thời gian đó chưa:

- Cùng `doctor`, `date`, `slot`
- Trạng thái khác `CANCELLED` và `REJECTED`

### Auto-generated Appointment ID

- Format: `AP` + 6 số ngẫu nhiên
- Đảm bảo unique trong database

### Email Notifications

System tự động gửi email khi:

- Lịch hẹn được xác nhận
- Lịch hẹn bị từ chối
- Lịch hẹn bị hủy

### Refund Logic

Khi lịch hẹn bị hủy:

- Nếu `payment.status = "PAID"` → Hoàn tiền vào ví bệnh nhân
- Cập nhật `walletBalance` và `walletHistory`

### Case Integration

- Mỗi appointment liên kết với 1 case
- Khi appointment được tạo → `case.appointmentId` được set
- Khi appointment status thay đổi → case status cũng được cập nhật

## Error Handling

| Status Code | Message                                      | Mô tả                     |
| ----------- | -------------------------------------------- | ------------------------- |
| 400         | Vui lòng cung cấp đầy đủ thông tin           | Thiếu field bắt buộc      |
| 400         | Bác sĩ đã có lịch hẹn vào {date} {slot}      | Trùng lịch                |
| 404         | Không tìm thấy bệnh án                       | Case không tồn tại        |
| 404         | Không tìm thấy lịch hẹn                      | Appointment không tồn tại |
| 403         | Bạn không có quyền tạo lịch hẹn cho case này | Không phải chủ case       |
| 403         | Bạn không phải là bác sĩ được đặt lịch hẹn   | Sai bác sĩ                |

## Examples

### Tạo lịch hẹn

```bash
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "case_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "specialty": "6405f7d2e4b0b7a7c8d9e0f2",
    "doctor": "6405f7d2e4b0b7a7c8d9e0f3",
    "date": "2025-04-20",
    "slot": "09:00-10:00"
  }'
```

### Lọc lịch hẹn theo bác sĩ và trạng thái

```bash
GET /appointments/doctor/6405f7d2e4b0b7a7c8d9e0f3?status=CONFIRMED&from_date=2025-04-01&to_date=2025-04-30
```
