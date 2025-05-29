# Case Module Documentation

Module quản lý bệnh án (case) trong hệ thống TalkToDoc, bao gồm việc tạo, cập nhật, và xử lý workflow của bệnh án.

## Base URL

```
/cases
```

## Endpoints

### 1. Tạo/Cập nhật bệnh án

**POST** `/cases`

Tạo mới hoặc cập nhật bệnh án với các hành động khác nhau.

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Request Body

```json
{
  "case_id": "6405f7d2e4b0b7a7c8d9e0f1", // Optional - ID case để update
  "specialty": "6405f7d2e4b0b7a7c8d9e0f2",
  "appointment_id": "6405f7d2e4b0b7a7c8d9e0f3", // Optional - khi đã có lịch hẹn
  "medical_form": {
    "symptoms": "Đau đầu kéo dài 3 ngày",
    "questions": [
      {
        "question": "Có tiền sử cao huyết áp?",
        "answer": "Không"
      },
      {
        "question": "Có đang căng thẳng không?",
        "answer": "Có"
      }
    ],
    "note": "Bệnh nhân có biểu hiện nhẹ, nên theo dõi thêm"
  },
  "action": "create" // create | save | submit | sendback
}
```

#### Response Success - Action: create

```json
{
  "statusCode": 201,
  "message": "Case created successfully",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "patient": "6405f7d2e4b0b7a7c8d9e0f4",
    "specialty": "6405f7d2e4b0b7a7c8d9e0f2",
    "medicalForm": {
      "symptoms": "Đau đầu kéo dài 3 ngày",
      "questions": [...]
    },
    "status": "draft",
    "isDeleted": false,
    "offers": [],
    "createdAt": "2025-01-14T10:30:00.000Z"
  }
}
```

#### Response Success - Action: submit

```json
{
  "statusCode": 200,
  "message": "Case submitted successfully and appointment linked",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "status": "pending",
    "appointmentId": "6405f7d2e4b0b7a7c8d9e0f3",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

### 2. Lấy danh sách bệnh án

**GET** `/cases`

#### Query Parameters

- `page` (optional, default: 1): Trang hiện tại
- `limit` (optional, default: 10): Số lượng mỗi trang
- `q` (optional): Tìm kiếm theo ID case, triệu chứng
- `status` (optional): Lọc theo trạng thái

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
    "data": [
      {
        "_id": "6405f7d2e4b0b7a7c8d9e0f1",
        "patient": {
          "_id": "6405f7d2e4b0b7a7c8d9e0f4",
          "fullName": "Nguyễn Văn A"
        },
        "specialty": {
          "_id": "6405f7d2e4b0b7a7c8d9e0f2",
          "name": "Nội khoa"
        },
        "status": "pending",
        "medicalForm": {
          "symptoms": "Đau đầu kéo dài 3 ngày"
        },
        "appointmentId": "6405f7d2e4b0b7a7c8d9e0f3",
        "offers": [
          {
            "createdAt": "2025-01-14T10:30:00.000Z",
            "createdBy": {
              "_id": "6405f7d2e4b0b7a7c8d9e0f5",
              "fullName": "BS. Nguyễn Văn B"
            },
            "note": "Đơn thuốc điều trị đau đầu",
            "medications": [
              {
                "medicationId": "6405f7d2e4b0b7a7c8d9e0f6",
                "name": "Paracetamol",
                "dosage": "500mg",
                "usage": "1 viên mỗi 8 tiếng",
                "duration": "3 ngày",
                "price": 50000,
                "quantity": 10
              }
            ]
          }
        ],
        "createdAt": "2025-01-14T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Xem chi tiết bệnh án

**GET** `/cases/:id`

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "patient": {
      "_id": "6405f7d2e4b0b7a7c8d9e0f4",
      "fullName": "Nguyễn Văn A",
      "email": "patient@example.com",
      "phoneNumber": "0987654321"
    },
    "specialty": {
      "_id": "6405f7d2e4b0b7a7c8d9e0f2",
      "name": "Nội khoa"
    },
    "status": "assigned",
    "medicalForm": {
      "symptoms": "Đau đầu kéo dài 3 ngày",
      "questions": [
        {
          "question": "Có tiền sử cao huyết áp?",
          "answer": "Không"
        }
      ],
      "note": "Bệnh nhân có biểu hiện nhẹ"
    },
    "appointmentId": {
      "_id": "6405f7d2e4b0b7a7c8d9e0f3",
      "appointmentId": "AP123456",
      "date": "2025-04-20",
      "slot": "09:00-10:00",
      "status": "CONFIRMED"
    },
    "offers": [
      {
        "createdAt": "2025-01-14T10:30:00.000Z",
        "createdBy": {
          "_id": "6405f7d2e4b0b7a7c8d9e0f5",
          "fullName": "BS. Nguyễn Văn B"
        },
        "note": "Đơn thuốc điều trị đau đầu",
        "medications": [
          {
            "medicationId": {
              "_id": "6405f7d2e4b0b7a7c8d9e0f6",
              "name": "Paracetamol",
              "price": 5000
            },
            "name": "Paracetamol",
            "dosage": "500mg",
            "usage": "1 viên mỗi 8 tiếng",
            "duration": "3 ngày",
            "price": 50000,
            "quantity": 10
          }
        ]
      }
    ],
    "isDeleted": false,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

### 4. Thêm đơn thuốc (Bác sĩ)

**POST** `/cases/:id/offer`

**Roles**: DOCTOR

#### Request Body

```json
{
  "note": "Đơn thuốc điều trị đau đầu theo đợt cấp",
  "medications": [
    {
      "medicationId": "6405f7d2e4b0b7a7c8d9e0f6",
      "name": "Paracetamol",
      "dosage": "500mg",
      "usage": "1 viên mỗi 8 tiếng khi đau",
      "duration": "3-5 ngày",
      "price": 50000,
      "quantity": 10
    },
    {
      "medicationId": "6405f7d2e4b0b7a7c8d9e0f7",
      "name": "Ibuprofen",
      "dosage": "400mg",
      "usage": "1 viên mỗi 12 tiếng",
      "duration": "3 ngày",
      "price": 80000,
      "quantity": 6
    }
  ],
  "pharmacyId": "6405f7d2e4b0b7a7c8d9e0f8"
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Offer added successfully",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "status": "completed",
    "offers": [
      {
        "createdAt": "2025-01-14T10:30:00.000Z",
        "createdBy": "6405f7d2e4b0b7a7c8d9e0f5",
        "note": "Đơn thuốc điều trị đau đầu theo đợt cấp",
        "medications": [
          {
            "medicationId": "6405f7d2e4b0b7a7c8d9e0f6",
            "name": "Paracetamol",
            "dosage": "500mg",
            "usage": "1 viên mỗi 8 tiếng khi đau",
            "duration": "3-5 ngày",
            "price": 50000,
            "quantity": 10
          }
        ]
      }
    ]
  }
}
```

### 5. Xóa bệnh án (Soft Delete)

**DELETE** `/cases/:id`

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Case deleted successfully",
  "success": true,
  "data": "Case deleted"
}
```

## Schemas

### Case Schema

```typescript
{
  _id: ObjectId;
  patient: ObjectId;              // Reference to Patient
  specialty: ObjectId;            // Reference to Specialty
  medicalForm?: {                 // Form triệu chứng và câu hỏi
    symptoms?: string;
    questions?: {
      question: string;
      answer: string;
    }[];
    note?: string;
    [key: string]: any;
  };
  appointmentId?: ObjectId;       // Reference to Appointment
  status: CaseStatus;             // Trạng thái case
  isDeleted: boolean;             // Soft delete flag
  deletedAt?: Date;               // Thời gian xóa
  offers?: {                      // Đơn thuốc từ bác sĩ
    createdAt: Date;
    createdBy: ObjectId;          // Reference to Doctor
    note: string;
    pharmacyId?: ObjectId;        // Reference to Pharmacy
    medications: {
      medicationId?: ObjectId;    // Reference to Medicine
      name?: string;
      dosage?: string;
      usage?: string;
      duration?: string;
      price?: number;
      quantity?: number;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

### SubmitCaseDto

```typescript
{
  case_id?: string;               // ID case để update (MongoId)
  specialty?: string;             // ID chuyên khoa (MongoId)
  appointment_id?: string;        // ID lịch hẹn (MongoId)
  medical_form?: {                // Form triệu chứng
    symptoms?: string;
    questions?: {
      question: string;
      answer: string;
    }[];
    note?: string;
    [key: string]: any;
  };
  action: CaseAction;             // Hành động xử lý
}
```

### AddOfferDto

```typescript
{
  note?: string;                  // Ghi chú của bác sĩ
  medications: {
    medicationId: string;         // ID thuốc (MongoId)
    name?: string;                // Tên thuốc
    dosage: string;               // Liều lượng
    usage: string;                // Cách dùng
    duration: string;             // Thời gian dùng
    price: number;                // Giá
    quantity: number;             // Số lượng
  }[];
  pharmacyId?: string;            // ID nhà thuốc (optional)
}
```

## Enums

### CaseStatus

```typescript
type CaseStatus =
  | 'draft' // Bản nháp
  | 'pending' // Chờ xử lý
  | 'assigned' // Đã giao cho bác sĩ
  | 'completed' // Hoàn thành
  | 'cancelled' // Đã hủy
```

### CaseAction

```typescript
enum CaseAction {
  CREATE = 'create', // Tạo mới case
  SAVE = 'save', // Lưu nháp
  SUBMIT = 'submit', // Gửi case và liên kết appointment
  SENDBACK = 'sendback', // Gửi lại case (nếu cần sửa)
}
```

## Business Logic

### Case Workflow

1. **CREATE**: Tạo case mới với status = 'draft'
2. **SAVE**: Lưu thông tin vào case đang có, giữ status hiện tại
3. **SUBMIT**:
   - Liên kết appointment với case
   - Chuyển status = 'pending'
   - Cập nhật appointment.status = 'PENDING'
4. **SENDBACK**: Chuyển status = 'draft' để chỉnh sửa

### Appointment Integration

- Khi case được submit → `case.appointmentId` được set
- Khi appointment được confirm → `case.status = 'assigned'`
- Khi appointment bị cancel → `case.status = 'cancelled'`

### Offer System

- Chỉ bác sĩ mới có thể thêm offer (đơn thuốc)
- Khi thêm offer → `case.status = 'completed'`
- Offer bao gồm thông tin thuốc và liều lượng chi tiết

### Soft Delete

- `isDeleted = true` thay vì xóa record
- `deletedAt` lưu thời gian xóa
- Chỉ chủ case hoặc admin mới xóa được

### Search & Filter

- Tìm kiếm theo: ID case, triệu chứng, ghi chú
- Lọc theo: status, specialty, ngày tạo
- Hỗ trợ pagination

## Integration với Modules khác

### Appointments Service

- Case luôn liên kết với 1 appointment
- Status sync giữa case và appointment

### Medicine Service

- Validate `medicationId` khi thêm offer
- Lấy thông tin thuốc từ Medicine collection

### User Service

- Populate thông tin patient và doctor
- Kiểm tra quyền truy cập

### Mail Service

- Gửi email thông báo khi case status thay đổi
- Gửi đơn thuốc cho bệnh nhân

## Error Handling

| Status Code | Message                                                  | Mô tả                        |
| ----------- | -------------------------------------------------------- | ---------------------------- |
| 400         | case_id không hợp lệ                                     | Invalid MongoId              |
| 400         | specialty không hợp lệ                                   | Invalid specialty ID         |
| 400         | action phải là một trong: create, save, submit, sendback | Invalid action               |
| 404         | Case not found                                           | Không tìm thấy case          |
| 404         | Appointment not found                                    | Không tìm thấy appointment   |
| 403         | Unauthorized to access this case                         | Không có quyền truy cập case |
| 409         | Case already has an appointment                          | Case đã có appointment       |

## Examples

### Tạo case mới

```bash
curl -X POST http://localhost:3000/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "specialty": "6405f7d2e4b0b7a7c8d9e0f2",
    "medical_form": {
      "symptoms": "Đau đầu kéo dài 3 ngày",
      "questions": [
        {"question": "Có tiền sử cao huyết áp?", "answer": "Không"}
      ]
    },
    "action": "create"
  }'
```

### Submit case với appointment

```bash
curl -X POST http://localhost:3000/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "case_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "appointment_id": "6405f7d2e4b0b7a7c8d9e0f3",
    "action": "submit"
  }'
```

### Bác sĩ thêm đơn thuốc

```bash
curl -X POST http://localhost:3000/cases/6405f7d2e4b0b7a7c8d9e0f1/offer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <doctor_token>" \
  -d '{
    "note": "Đơn thuốc điều trị đau đầu",
    "medications": [
      {
        "medicationId": "6405f7d2e4b0b7a7c8d9e0f6",
        "name": "Paracetamol",
        "dosage": "500mg",
        "usage": "1 viên mỗi 8 tiếng",
        "duration": "3 ngày",
        "price": 50000,
        "quantity": 10
      }
    ]
  }'
```
