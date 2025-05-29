# Specialty Service Module Documentation

## Tổng quan

Specialty Service Module quản lý các chuyên khoa y tế trong hệ thống TalkToDoc, bao gồm thêm, sửa, xóa và tìm kiếm các chuyên khoa.

## Base URL

```
/api/v1/Specialties
```

## API Endpoints

### 1. Tìm kiếm chuyên khoa

**GET** `/api/v1/Specialties/search`

Tìm kiếm chuyên khoa với phân trang và sắp xếp.

#### Query Parameters

- `query` (optional): Từ khóa tìm kiếm theo tên
- `page` (optional, default: 1): Trang hiện tại
- `limit` (optional, default: 10): Số lượng mỗi trang
- `sortField` (optional, default: 'name'): Trường sắp xếp
- `sortOrder` (optional, default: 'asc'): Thứ tự sắp xếp

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
        "id": "SP123456",
        "name": "Tim mạch",
        "description": "Chuyên khoa liên quan đến tim và mạch máu",
        "isActive": true,
        "config": {
          "requiresAppointment": true,
          "hasEmergencySupport": true
        },
        "avatarUrl": "https://example.com/cardiology-icon.png",
        "createdAt": "2025-01-14T10:30:00.000Z",
        "updatedAt": "2025-01-14T10:30:00.000Z"
      }
    ]
  }
}
```

### 2. Lấy tất cả chuyên khoa

**GET** `/api/v1/Specialties`

Lấy danh sách tất cả chuyên khoa đang hoạt động.

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": [
    {
      "_id": "6405f7d2e4b0b7a7c8d9e0f1",
      "id": "SP123456",
      "name": "Tim mạch",
      "description": "Chuyên khoa liên quan đến tim và mạch máu",
      "isActive": true,
      "config": {
        "requiresAppointment": true,
        "hasEmergencySupport": true
      },
      "avatarUrl": "https://example.com/cardiology-icon.png",
      "createdAt": "2025-01-14T10:30:00.000Z"
    },
    {
      "_id": "6405f7d2e4b0b7a7c8d9e0f2",
      "id": "SP123457",
      "name": "Nội khoa",
      "description": "Chuyên khoa điều trị các bệnh nội khoa",
      "isActive": true,
      "config": {
        "requiresAppointment": true,
        "hasEmergencySupport": false
      },
      "avatarUrl": "https://example.com/internal-medicine-icon.png",
      "createdAt": "2025-01-14T10:30:00.000Z"
    }
  ]
}
```

### 3. Lấy chi tiết chuyên khoa

**GET** `/api/v1/Specialties/:id`

Lấy thông tin chi tiết của một chuyên khoa.

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "id": "SP123456",
    "name": "Tim mạch",
    "description": "Chuyên khoa liên quan đến tim và mạch máu, bao gồm điều trị các bệnh về tim, mạch máu và hệ tuần hoàn",
    "isActive": true,
    "config": {
      "requiresAppointment": true,
      "hasEmergencySupport": true,
      "averageConsultationTime": 30,
      "supportedServices": ["tư vấn online", "khám trực tiếp", "cấp cứu"]
    },
    "avatarUrl": "https://example.com/cardiology-icon.png",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

#### Response Error - Not Found

```json
{
  "statusCode": 404,
  "message": "Specialty not found",
  "success": false,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/Specialties/invalid-id"
}
```

### 4. Tạo chuyên khoa mới

**POST** `/api/v1/Specialties`

Tạo chuyên khoa mới trong hệ thống.

#### Request Body

```json
{
  "name": "Da liễu",
  "description": "Chuyên khoa điều trị các bệnh về da và tóc",
  "isActive": true,
  "config": {
    "requiresAppointment": true,
    "hasEmergencySupport": false,
    "averageConsultationTime": 20,
    "supportedServices": ["tư vấn online", "khám trực tiếp"]
  }
}
```

#### Response Success

```json
{
  "statusCode": 201,
  "message": "Specialty created successfully",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f3",
    "id": "SP789123",
    "name": "Da liễu",
    "description": "Chuyên khoa điều trị các bệnh về da và tóc",
    "isActive": true,
    "config": {
      "requiresAppointment": true,
      "hasEmergencySupport": false,
      "averageConsultationTime": 20,
      "supportedServices": ["tư vấn online", "khám trực tiếp"]
    },
    "avatarUrl": "",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

#### Response Error - Validation

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "success": false,
  "errors": {
    "name": "Name is required"
  },
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/Specialties"
}
```

### 5. Cập nhật chuyên khoa

**PUT** `/api/v1/Specialties/:id`

Cập nhật thông tin chuyên khoa đã tồn tại.

#### Request Body

```json
{
  "name": "Tim mạch (Cập nhật)",
  "description": "Chuyên khoa tim mạch với dịch vụ nâng cao",
  "isActive": true,
  "config": {
    "requiresAppointment": true,
    "hasEmergencySupport": true,
    "averageConsultationTime": 45,
    "supportedServices": ["tư vấn online", "khám trực tiếp", "cấp cứu", "phẫu thuật"]
  }
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Specialty updated successfully",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "id": "SP123456",
    "name": "Tim mạch (Cập nhật)",
    "description": "Chuyên khoa tim mạch với dịch vụ nâng cao",
    "isActive": true,
    "config": {
      "requiresAppointment": true,
      "hasEmergencySupport": true,
      "averageConsultationTime": 45,
      "supportedServices": ["tư vấn online", "khám trực tiếp", "cấp cứu", "phẫu thuật"]
    },
    "avatarUrl": "https://example.com/cardiology-icon.png",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T11:00:00.000Z"
  }
}
```

### 6. Xóa chuyên khoa

**DELETE** `/api/v1/Specialties/:id`

Xóa chuyên khoa khỏi hệ thống.

#### Response Success

```
HTTP 204 No Content
```

#### Response Error - Not Found

```json
{
  "statusCode": 404,
  "message": "Specialty not found",
  "success": false,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/Specialties/invalid-id"
}
```

## DTOs

### CreateSpecialtyDto

```typescript
export class CreateSpecialtyDto {
  name: string // Tên chuyên khoa (bắt buộc)
  description?: string // Mô tả chuyên khoa (tùy chọn)
  isActive?: boolean // Trạng thái hoạt động (mặc định: true)
  config?: Record<string, any> // Cấu hình bổ sung (tùy chọn)
}
```

**Validation:**

- `name`: Bắt buộc, không rỗng, phải là string
- `description`: Tùy chọn, phải là string
- `isActive`: Tùy chọn, phải là boolean
- `config`: Tùy chọn, phải là object

### UpdateSpecialtyDto

```typescript
export class UpdateSpecialtyDto {
  name?: string // Tên chuyên khoa mới (tùy chọn)
  description?: string // Mô tả mới (tùy chọn)
  isActive?: boolean // Trạng thái mới (tùy chọn)
  config?: Record<string, any> // Cấu hình mới (tùy chọn)
}
```

**Tất cả fields đều tùy chọn trong update**

## Schemas

### Specialty Schema

```typescript
export class Specialty {
  _id: ObjectId // ID MongoDB tự động tạo
  id: string // ID unique (SP + 6 số)
  name: string // Tên chuyên khoa (unique)
  description?: string // Mô tả chuyên khoa
  isActive: boolean // Trạng thái hoạt động (mặc định: true)
  config?: Record<string, any> // Cấu hình bổ sung
  avatarUrl?: string // URL hình đại diện (mặc định: rỗng)
  createdAt: Date // Thời gian tạo
  updatedAt: Date // Thời gian cập nhật
}
```

### Config Object Examples

```typescript
// Cấu hình cơ bản
{
  "requiresAppointment": true,
  "hasEmergencySupport": false,
  "averageConsultationTime": 30
}

// Cấu hình nâng cao
{
  "requiresAppointment": true,
  "hasEmergencySupport": true,
  "averageConsultationTime": 45,
  "supportedServices": ["tư vấn online", "khám trực tiếp", "cấp cứu"],
  "specialRequirements": ["fasting", "medication_stop"],
  "costRange": {
    "min": 200000,
    "max": 500000
  }
}
```

## Business Logic

### ID Generation

- **Format**: `SP` + 6 số ngẫu nhiên
- **Example**: `SP123456`, `SP789012`
- **Unique Check**: Đảm bảo không trùng trong database

### Search Functionality

- Tìm kiếm theo `name` (case-insensitive)
- Hỗ trợ regex search
- Pagination với `page` và `limit`
- Sorting theo bất kỳ field nào

### Active Status

- `isActive = true`: Chuyên khoa hoạt động, hiển thị cho user
- `isActive = false`: Chuyên khoa bị vô hiệu hóa, ẩn khỏi danh sách

### Config System

Flexible configuration cho mỗi chuyên khoa:

- Service requirements
- Emergency support
- Time estimates
- Cost information
- Special instructions

## Integration với Modules khác

### Doctor Service

- Bác sĩ được gán specialty khi đăng ký
- Validate specialty tồn tại và active

### Appointment Service

- Lịch hẹn phải có specialty
- Validate specialty có `requiresAppointment = true`

### Case Module

- Case được gán specialty
- Validate specialty cho medical form

## Error Handling

| Status Code | Message             | Mô tả                        |
| ----------- | ------------------- | ---------------------------- |
| 400         | Validation failed   | Dữ liệu đầu vào không hợp lệ |
| 404         | Specialty not found | Không tìm thấy chuyên khoa   |
| 409         | Name already exists | Tên chuyên khoa đã tồn tại   |
| 500         | Server error        | Lỗi server nội bộ            |

## Usage Examples

### Tạo chuyên khoa mới

```bash
curl -X POST http://localhost:3000/api/v1/Specialties \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nhi khoa",
    "description": "Chuyên khoa điều trị trẻ em",
    "isActive": true,
    "config": {
      "requiresAppointment": true,
      "hasEmergencySupport": true,
      "averageConsultationTime": 25,
      "ageRange": {"min": 0, "max": 18}
    }
  }'
```

### Tìm kiếm chuyên khoa

```bash
curl -X GET "http://localhost:3000/api/v1/Specialties/search?query=tim&page=1&limit=5&sortField=name&sortOrder=asc"
```

### Cập nhật trạng thái chuyên khoa

```bash
curl -X PUT http://localhost:3000/api/v1/Specialties/SP123456 \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

## Common Specialties

Danh sách chuyên khoa phổ biến trong hệ thống:

1. **Tim mạch** - Cardiology
2. **Nội khoa** - Internal Medicine
3. **Ngoại khoa** - Surgery
4. **Nhi khoa** - Pediatrics
5. **Phụ sản** - Obstetrics & Gynecology
6. **Da liễu** - Dermatology
7. **Mắt** - Ophthalmology
8. **Tai mũi họng** - ENT
9. **Thần kinh** - Neurology
10. **Tâm thần** - Psychiatry
11. **Chỉnh hình** - Orthopedics
12. **Tiết niệu** - Urology
