# Case Module Documentation

## Tổng quan

Case Module quản lý bệnh án trong hệ thống TalkToDoc, bao gồm việc tạo, cập nhật, theo dõi trạng thái, kê đơn thuốc và xóa mềm bệnh án. Module này tích hợp chặt chẽ với Appointment Service để đảm bảo quy trình tư vấn y tế hoàn chỉnh.

Mỗi case được tự động gán một **caseId** duy nhất theo format `CA-xxxxxxx` (từ CA-0000000 đến CA-9999999) khi được tạo.

## Base URL

```
/api/v1/case
```

## API Endpoints

### 1. Tạo/Cập nhật bệnh án

**POST** `/api/v1/case/data`

Tạo mới hoặc cập nhật bệnh án với các hành động khác nhau.

#### Request Body

```json
{
  "case_id": "664b1e2f2f8b2c001e7e7e7e",
  "appointment_id": "664b1e2f2f8b2c001e7e7e80",
  "specialty": "664b1e2f2f8b2c001e7e7e7f",
  "medical_form": {
    "symptoms": "Đau đầu 3 ngày",
    "questions": [
      {
        "question": "Có tiền sử cao huyết áp?",
        "answer": "Không"
      }
    ],
    "note": "Bệnh nhân có biểu hiện nhẹ, nên theo dõi thêm"
  },
  "action": "save"
}
```

#### Response Success - Tạo mới

```json
{
  "statusCode": 201,
  "message": "Tạo bệnh án thành công",
  "success": true,
  "data": {
    "case_id": "664b1e2f2f8b2c001e7e7e7e",
    "_id": "664b1e2f2f8b2c001e7e7e7e",
    "caseId": "CA-1234567",
    "patient": "664b1e2f2f8b2c001e7e7e7d",
    "specialty": "664b1e2f2f8b2c001e7e7e7f",
    "medicalForm": {
      "symptoms": "Đau đầu 3 ngày",
      "questions": []
    },
    "status": "draft",
    "isDeleted": false,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

#### Response Success - Cập nhật

```json
{
  "statusCode": 200,
  "message": "Cập nhật bệnh án thành công",
  "success": true,
  "data": {
    "case_id": "664b1e2f2f8b2c001e7e7e7e",
    "_id": "664b1e2f2f8b2c001e7e7e7e",
    "caseId": "CA-1234567",
    "patient": "664b1e2f2f8b2c001e7e7e7d",
    "specialty": "664b1e2f2f8b2c001e7e7e7f",
    "medicalForm": {
      "symptoms": "Đau đầu 3 ngày",
      "questions": [
        {
          "question": "Có tiền sử cao huyết áp?",
          "answer": "Không"
        }
      ],
      "note": "Bệnh nhân có biểu hiện nhẹ"
    },
    "appointmentId": "664b1e2f2f8b2c001e7e7e80",
    "status": "pending",
    "offers": [],
    "isDeleted": false,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:35:00.000Z"
  }
}
```

### 2. Lấy danh sách bệnh án

**GET** `/api/v1/case`

Lấy danh sách bệnh án với tìm kiếm và phân trang.

#### Query Parameters

- `q` (optional): Từ khóa tìm kiếm theo triệu chứng, ghi chú, hoặc **caseId**
- `status` (optional): Trạng thái bệnh án (draft, pending, assigned, completed, cancelled)
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
    "data": [
      {
        "_id": "664b1e2f2f8b2c001e7e7e7e",
        "caseId": "CA-1234567",
        "patient": "664b1e2f2f8b2c001e7e7e7d",
        "specialty": {
          "_id": "664b1e2f2f8b2c001e7e7e7f",
          "name": "Nội tổng quát"
        },
        "medicalForm": {
          "symptoms": "Đau đầu 3 ngày",
          "questions": [
            {
              "question": "Có tiền sử cao huyết áp?",
              "answer": "Không"
            }
          ],
          "note": "Bệnh nhân có biểu hiện nhẹ"
        },
        "appointmentId": {
          "_id": "664b1e2f2f8b2c001e7e7e80",
          "appointmentId": "AP123456",
          "date": "2025-01-20T10:00:00.000Z",
          "slot": "08:00-09:00",
          "status": "CONFIRMED",
          "doctor": {
            "_id": "664b1e2f2f8b2c001e7e7e81",
            "fullName": "BS. Nguyễn Văn A"
          },
          "patient": {
            "_id": "664b1e2f2f8b2c001e7e7e7d",
            "fullName": "Nguyễn Văn B"
          }
        },
        "status": "assigned",
        "offers": [],
        "isDeleted": false,
        "createdAt": "2025-01-14T10:30:00.000Z",
        "updatedAt": "2025-01-14T10:35:00.000Z"
      }
    ]
  }
}
```

### 3. Lấy chi tiết bệnh án

**GET** `/api/v1/case/:id`

Lấy thông tin chi tiết của một bệnh án.

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Lấy thông tin bệnh án thành công",
  "success": true,
  "data": {
    "_id": "664b1e2f2f8b2c001e7e7e7e",
    "caseId": "CA-1234567",
    "patient": "664b1e2f2f8b2c001e7e7e7d",
    "specialty": {
      "_id": "664b1e2f2f8b2c001e7e7e7f",
      "name": "Nội tổng quát"
    },
    "medicalForm": {
      "symptoms": "Đau đầu 3 ngày",
      "questions": [
        {
          "question": "Có tiền sử cao huyết áp?",
          "answer": "Không"
        }
      ],
      "note": "Bệnh nhân có biểu hiện nhẹ",
      "diagnosis": "Đau đầu căng thẳng",
      "treatment": "Nghỉ ngơi, uống thuốc giảm đau"
    },
    "appointmentId": {
      "_id": "664b1e2f2f8b2c001e7e7e80",
      "doctor": {
        "_id": "664b1e2f2f8b2c001e7e7e81",
        "fullName": "BS. Nguyễn Văn A"
      },
      "patient": {
        "_id": "664b1e2f2f8b2c001e7e7e7d",
        "fullName": "Nguyễn Văn B"
      }
    },
    "status": "completed",
    "offers": [
      {
        "createdAt": "2025-01-14T12:00:00.000Z",
        "createdBy": "664b1e2f2f8b2c001e7e7e81",
        "note": "Uống thuốc sau ăn",
        "pharmacyId": "664b1e2f2f8b2c001e7e7e91",
        "shippingAddress": "123 Đường ABC, Quận 1, TP.HCM",
        "shippingPhone": "0901234567",
        "medications": [
          {
            "medicationId": "664b1e2f2f8b2c001e7e7e90",
            "name": "Paracetamol",
            "dosage": "500mg",
            "usage": "1 viên mỗi 8 tiếng",
            "duration": "3 ngày",
            "price": 50000,
            "quantity": 6
          }
        ]
      }
    ],
    "offerSummary": [
      {
        "date": "14/01/2025",
        "doctor": "BS. Nguyễn Văn A",
        "summary": "Paracetamol 500mg x 3 ngày"
      }
    ],
    "isDeleted": false,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T12:00:00.000Z"
  }
}
```

### 4. Bác sĩ kê đơn thuốc

**PATCH** `/api/v1/case/:id/offer`

Bác sĩ thêm đơn thuốc cho bệnh án.

#### Request Body

```json
{
  "note": "Uống thuốc sau ăn, tránh uống khi đói",
  "pharmacyId": "664b1e2f2f8b2c001e7e7e91",
  "shippingAddress": "123 Đường ABC, Quận 1, TP.HCM",
  "shippingPhone": "0901234567",
  "medications": [
    {
      "medicationId": "664b1e2f2f8b2c001e7e7e90",
      "name": "Paracetamol",
      "dosage": "500mg",
      "usage": "1 viên mỗi 8 tiếng",
      "duration": "3 ngày",
      "price": 50000,
      "quantity": 6
    },
    {
      "medicationId": "664b1e2f2f8b2c001e7e7e92",
      "name": "Vitamin C",
      "dosage": "1000mg",
      "usage": "1 viên mỗi ngày",
      "duration": "7 ngày",
      "price": 80000,
      "quantity": 7
    }
  ]
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Đã thêm đơn thuốc thành công",
  "success": true,
  "data": "664b1e2f2f8b2c001e7e7e7e"
}
```

### 5. Xóa mềm bệnh án

**PATCH** `/api/v1/case/:id/delete`

Xóa mềm bệnh án (ẩn khỏi danh sách).

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Đã xoá bệnh án (ẩn khỏi danh sách)",
  "success": true,
  "data": "664b1e2f2f8b2c001e7e7e7e"
}
```

## DTOs

### SubmitCaseDto

```typescript
export class SubmitCaseDto {
  case_id?: string // ID bệnh án (tùy chọn khi tạo mới)
  specialty?: string // ID chuyên khoa (bắt buộc khi tạo mới)
  appointment_id?: string // ID lịch hẹn (bắt buộc khi submit)
  medical_form?: MedicalFormType // Dữ liệu form y tế
  action: 'create' | 'save' | 'submit' | 'sendback' // Hành động thực hiện
}
```

**Validation:**

- `case_id`: Phải là MongoID hợp lệ (nếu có)
- `specialty`: Phải là MongoID hợp lệ (nếu có)
- `appointment_id`: Phải là MongoID hợp lệ (nếu có)
- `medical_form`: Phải là object với structure cụ thể (nếu có)
- `action`: Bắt buộc, phải là một trong các giá trị enum

### AddOfferDto

```typescript
export class AddOfferDto {
  note?: string // Ghi chú của bác sĩ
  pharmacyId?: string // ID nhà thuốc
  shippingAddress?: string // Địa chỉ giao hàng
  shippingPhone?: string // SĐT giao hàng
  medications: MedicationItemDto[] // Danh sách thuốc
}

export class MedicationItemDto {
  name?: string // Tên thuốc
  medicationId: string // ID thuốc (bắt buộc)
  dosage: string // Liều lượng (bắt buộc)
  usage: string // Cách dùng (bắt buộc)
  duration: string // Thời gian dùng (bắt buộc)
  price: number // Giá thuốc (bắt buộc)
  quantity: number // Số lượng (bắt buộc)
}
```

## Schemas

### Case Schema

```typescript
export class Case {
  _id: ObjectId // ID MongoDB tự động tạo
  caseId: string // ID case theo format CA-xxxxxxx (unique)
  patient: ObjectId // ID bệnh nhân (ref: Patient)
  specialty: ObjectId // ID chuyên khoa (ref: Specialty)
  medicalForm?: MedicalFormType // Dữ liệu form y tế
  appointmentId?: ObjectId // ID lịch hẹn (ref: Appointment)
  status: 'draft' | 'pending' | 'assigned' | 'completed' | 'cancelled' // Trạng thái
  isDeleted: boolean // Đánh dấu xóa mềm
  deletedAt?: Date // Thời gian xóa
  offers?: Offer[] // Danh sách đơn thuốc
  createdAt: Date // Thời gian tạo
  updatedAt: Date // Thời gian cập nhật
}

export interface MedicalFormType {
  symptoms?: string // Triệu chứng
  questions?: Array<{ question: string; answer: string }> // Câu hỏi tư vấn
  note?: string // Ghi chú
  diagnosis?: string // Chẩn đoán
  treatment?: string // Phương pháp điều trị
  followup?: string // Hướng dẫn theo dõi
  [key: string]: unknown // Các field động khác
}

export interface Offer {
  createdAt: Date // Thời gian tạo đơn
  createdBy: ObjectId // ID bác sĩ kê đơn
  note: string // Ghi chú bác sĩ
  pharmacyId?: ObjectId // ID nhà thuốc
  shippingAddress?: string // Địa chỉ giao hàng
  shippingPhone?: string // SĐT giao hàng
  medications: Medication[] // Danh sách thuốc
}

export interface Medication {
  medicationId?: ObjectId // ID thuốc
  name?: string // Tên thuốc
  dosage?: string // Liều lượng
  usage?: string // Cách dùng
  duration?: string // Thời gian dùng
  price?: number // Giá thuốc
  quantity?: number // Số lượng
}
```

## Business Logic

### Case ID Generation

- **Format**: `CA-xxxxxxx` (7 chữ số)
- **Range**: CA-0000000 đến CA-9999999
- **Uniqueness**: Đảm bảo unique trong database với retry logic
- **Auto-generation**: Tự động tạo khi create case mới

### Case Status Workflow

1. **draft**: Bệnh án đang được soạn thảo
2. **pending**: Đã gửi yêu cầu tư vấn, chờ bác sĩ xác nhận
3. **assigned**: Bác sĩ đã xác nhận và đang xử lý
4. **completed**: Hoàn thành tư vấn/điều trị
5. **cancelled**: Đã hủy bệnh án

### Action Handlers

#### CREATE Action

- Tạo case mới với status = "draft"
- Bắt buộc có specialty
- Không cần case_id
- **Tự động tạo caseId unique**

#### SAVE Action

- Lưu tạm thông tin medical_form
- Chỉ áp dụng khi status = "draft"

#### SUBMIT Action

- **draft → pending**: Cần appointment_id
- **pending → assigned**: Tự động khi appointment CONFIRMED
- **assigned → completed**: Cần appointment COMPLETED

#### SENDBACK Action

- Chỉ từ "assigned" → "draft"
- Cho phép chỉnh sửa lại

### Integration với Appointment

- Case tự động chuyển status khi appointment thay đổi
- Đồng bộ hai chiều giữa case và appointment
- Validate appointment status trước khi submit

### Offer Management

- Chỉ bác sĩ được gán mới có thể kê đơn
- Một case có thể có nhiều offers
- Không validate medicationId trong database
- Lưu thông tin giao hàng cho từng offer

## Security & Authorization

### Access Control

- **PATIENT**: Chỉ truy cập case của mình
- **DOCTOR**: Truy cập case được gán qua appointment
- **EMPLOYEE/ADMIN**: Truy cập tất cả case

### Data Validation

- Validate ObjectId cho tất cả reference fields
- Kiểm tra quyền sở hữu trước khi thao tác
- Validate trạng thái trước khi chuyển đổi
- **Đảm bảo caseId unique khi tạo mới**

## Error Handling

| Status Code | Message                                       | Mô tả                        |
| ----------- | --------------------------------------------- | ---------------------------- |
| 400         | Validation failed                             | Dữ liệu đầu vào không hợp lệ |
| 400         | Bạn không có quyền cập nhật case này          | Không có quyền truy cập      |
| 400         | Chỉ có thể lưu tạm khi ở trạng thái nháp      | Trạng thái không phù hợp     |
| 400         | Vui lòng chọn lịch hẹn trước                  | Thiếu appointment_id         |
| 400         | Lịch hẹn chưa được bác sĩ xác nhận            | Appointment chưa CONFIRMED   |
| 400         | Lịch hẹn chưa được hoàn tất                   | Appointment chưa COMPLETED   |
| 400         | Không thể tạo caseId unique sau nhiều lần thử | CaseId generation failed     |
| 404         | Không tìm thấy bệnh án                        | Case không tồn tại           |
| 404         | Không tìm thấy lịch hẹn                       | Appointment không tồn tại    |

## Usage Examples

### Tạo case mới

```bash
curl -X POST http://localhost:3000/api/v1/case/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "specialty": "664b1e2f2f8b2c001e7e7e7f",
    "medical_form": {
      "symptoms": "Đau đầu kéo dài 3 ngày",
      "questions": []
    },
    "action": "create"
  }'
```

### Lưu tạm case

```bash
curl -X POST http://localhost:3000/api/v1/case/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "case_id": "664b1e2f2f8b2c001e7e7e7e",
    "medical_form": {
      "symptoms": "Đau đầu kéo dài 3 ngày, kèm chóng mặt",
      "questions": [
        {
          "question": "Có tiền sử cao huyết áp?",
          "answer": "Không"
        }
      ]
    },
    "action": "save"
  }'
```

### Submit case với appointment

```bash
curl -X POST http://localhost:3000/api/v1/case/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "case_id": "664b1e2f2f8b2c001e7e7e7e",
    "appointment_id": "664b1e2f2f8b2c001e7e7e80",
    "action": "submit"
  }'
```

### Kê đơn thuốc

```bash
curl -X PATCH http://localhost:3000/api/v1/case/664b1e2f2f8b2c001e7e7e7e/offer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DOCTOR_JWT_TOKEN}" \
  -d '{
    "note": "Uống thuốc sau ăn, nghỉ ngơi đầy đủ",
    "shippingAddress": "123 Đường ABC, Quận 1, TP.HCM",
    "shippingPhone": "0901234567",
    "medications": [
      {
        "medicationId": "664b1e2f2f8b2c001e7e7e90",
        "name": "Paracetamol",
        "dosage": "500mg",
        "usage": "1 viên mỗi 8 tiếng",
        "duration": "3 ngày",
        "price": 50000,
        "quantity": 6
      }
    ]
  }'
```

### Tìm kiếm case theo caseId

```bash
curl -X GET "http://localhost:3000/api/v1/case?q=CA-1234567" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

### Tìm kiếm case theo triệu chứng và trạng thái

```bash
curl -X GET "http://localhost:3000/api/v1/case?q=đau%20đầu&status=assigned&page=1&limit=5" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

## Integration với Modules khác

### Appointment Service

- Đồng bộ status giữa case và appointment
- Validate appointment trước khi submit case
- Liên kết case với appointment qua appointmentId

### Medicine Service

- Reference medications trong offers
- Không validate tồn tại medicine (flexible)

### User Service

- Reference patient và doctor
- Kiểm tra quyền truy cập dựa trên role

### Pharmacy Service

- Reference pharmacyId trong offers
- Hỗ trợ thông tin giao hàng thuốc

### Payment Service

- Tính toán chi phí dựa trên offers
- Theo dõi thanh toán cho case
