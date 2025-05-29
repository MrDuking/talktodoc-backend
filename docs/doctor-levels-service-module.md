# Doctor Levels Service Module Documentation

## Tổng quan

Doctor Levels Service Module quản lý các cấp bậc bác sĩ trong hệ thống TalkToDoc, bao gồm việc tạo, cập nhật, xóa và tìm kiếm các cấp bậc với mức phí tương ứng.

## Base URL

```
/api/v1/doctor_levels
```

## API Endpoints

### 1. Tìm kiếm cấp bậc bác sĩ

**GET** `/api/v1/doctor_levels/search`

Tìm kiếm cấp bậc bác sĩ với phân trang và sắp xếp.

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
    "total": 15,
    "page": 1,
    "limit": 10,
    "data": [
      {
        "_id": "6405f7d2e4b0b7a7c8d9e0f1",
        "id": "DL123456",
        "name": "Chuyên khoa I",
        "description": "Bác sĩ chuyên khoa cấp 1",
        "base_price": 200000,
        "isActive": true,
        "createdAt": "2025-01-14T10:30:00.000Z",
        "updatedAt": "2025-01-14T10:30:00.000Z"
      }
    ]
  }
}
```

### 2. Lấy tất cả cấp bậc bác sĩ

**GET** `/api/v1/doctor_levels`

Lấy danh sách tất cả cấp bậc bác sĩ đang hoạt động.

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": [
    {
      "_id": "6405f7d2e4b0b7a7c8d9e0f1",
      "id": "DL123456",
      "name": "Thực tập sinh",
      "description": "Bác sĩ thực tập, mới tốt nghiệp",
      "base_price": 100000,
      "isActive": true,
      "createdAt": "2025-01-14T10:30:00.000Z"
    },
    {
      "_id": "6405f7d2e4b0b7a7c8d9e0f2",
      "id": "DL123457",
      "name": "Chuyên khoa I",
      "description": "Bác sĩ chuyên khoa cấp 1",
      "base_price": 200000,
      "isActive": true,
      "createdAt": "2025-01-14T10:30:00.000Z"
    },
    {
      "_id": "6405f7d2e4b0b7a7c8d9e0f3",
      "id": "DL123458",
      "name": "Chuyên khoa II",
      "description": "Bác sĩ chuyên khoa cấp 2",
      "base_price": 350000,
      "isActive": true,
      "createdAt": "2025-01-14T10:30:00.000Z"
    }
  ]
}
```

### 3. Lấy chi tiết cấp bậc bác sĩ

**GET** `/api/v1/doctor_levels/:id`

Lấy thông tin chi tiết của một cấp bậc bác sĩ.

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "id": "DL123456",
    "name": "Chuyên khoa I",
    "description": "Bác sĩ chuyên khoa cấp 1, có kinh nghiệm từ 3-5 năm",
    "base_price": 200000,
    "isActive": true,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

#### Response Error - Not Found

```json
{
  "statusCode": 404,
  "message": "Doctor level not found",
  "success": false,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/doctor_levels/invalid-id"
}
```

### 4. Tạo cấp bậc bác sĩ mới

**POST** `/api/v1/doctor_levels`

Tạo cấp bậc bác sĩ mới trong hệ thống.

#### Request Body

```json
{
  "name": "Giáo sư",
  "description": "Bác sĩ cấp giáo sư, có kinh nghiệm trên 20 năm",
  "base_price": 500000,
  "isActive": true
}
```

#### Response Success

```json
{
  "statusCode": 201,
  "message": "Doctor level created successfully",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f4",
    "id": "DL789123",
    "name": "Giáo sư",
    "description": "Bác sĩ cấp giáo sư, có kinh nghiệm trên 20 năm",
    "base_price": 500000,
    "isActive": true,
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
    "name": "Name is required",
    "base_price": "Base price must be a number"
  },
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/doctor_levels"
}
```

### 5. Cập nhật cấp bậc bác sĩ

**PUT** `/api/v1/doctor_levels/:id`

Cập nhật thông tin cấp bậc bác sĩ đã tồn tại.

#### Request Body

```json
{
  "name": "Chuyên khoa I (Cập nhật)",
  "description": "Bác sĩ chuyên khoa cấp 1 với mức phí điều chỉnh",
  "base_price": 250000,
  "isActive": true
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Doctor level updated successfully",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "id": "DL123456",
    "name": "Chuyên khoa I (Cập nhật)",
    "description": "Bác sĩ chuyên khoa cấp 1 với mức phí điều chỉnh",
    "base_price": 250000,
    "isActive": true,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T11:00:00.000Z"
  }
}
```

### 6. Xóa cấp bậc bác sĩ

**DELETE** `/api/v1/doctor_levels/:id`

Xóa cấp bậc bác sĩ khỏi hệ thống.

#### Response Success

```
HTTP 204 No Content
```

#### Response Error - Not Found

```json
{
  "statusCode": 404,
  "message": "Doctor level not found",
  "success": false,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/doctor_levels/invalid-id"
}
```

## DTOs

### CreateDoctorLevelDto

```typescript
export class CreateDoctorLevelDto {
  name: string // Tên cấp bậc (bắt buộc)
  description?: string // Mô tả cấp bậc (tùy chọn)
  base_price: number // Mức phí cơ bản (bắt buộc)
  isActive: boolean // Trạng thái hoạt động (bắt buộc)
}
```

**Validation:**

- `name`: Bắt buộc, không rỗng, phải là string
- `description`: Tùy chọn, phải là string
- `base_price`: Bắt buộc, phải là number
- `isActive`: Bắt buộc, phải là boolean

### UpdateDoctorLevelDto

```typescript
export class UpdateDoctorLevelDto {
  name?: string // Tên cấp bậc mới (tùy chọn)
  description?: string // Mô tả mới (tùy chọn)
  base_price?: number // Mức phí mới (tùy chọn)
  isActive?: boolean // Trạng thái mới (tùy chọn)
}
```

**Tất cả fields đều tùy chọn trong update**

## Schemas

### DoctorLevel Schema

```typescript
export class DoctorLevel {
  _id: ObjectId // ID MongoDB tự động tạo
  id: string // ID unique (DL + 6 số)
  name: string // Tên cấp bậc bác sĩ
  description?: string // Mô tả chi tiết cấp bậc
  base_price: number // Mức phí khám cơ bản (VND)
  isActive: boolean // Trạng thái hoạt động (mặc định: true)
  createdAt: Date // Thời gian tạo
  updatedAt: Date // Thời gian cập nhật
}
```

## Business Logic

### ID Generation

- **Format**: `DL` + 6 số ngẫu nhiên
- **Example**: `DL123456`, `DL789012`
- **Unique Check**: Đảm bảo không trùng trong database

### Pricing System

- `base_price` là mức phí cơ bản cho mỗi lần khám
- Đơn vị: VND (Việt Nam Đồng)
- Có thể có các multiplier dựa trên specialty hoặc thời gian

### Search Functionality

- Tìm kiếm theo `name` (case-insensitive)
- Hỗ trợ regex search
- Pagination với `page` và `limit`
- Sorting theo bất kỳ field nào

### Active Status

- `isActive = true`: Cấp bậc hoạt động, có thể gán cho bác sĩ
- `isActive = false`: Cấp bậc bị vô hiệu hóa, không thể sử dụng

## Integration với Modules khác

### Doctor Service

- Bác sĩ được gán `rank` (doctor level) khi đăng ký
- Validate doctor level tồn tại và active
- Sử dụng `base_price` để tính phí khám

### Appointment Service

- Tính toán `doctorFee` dựa trên `base_price` của doctor level
- Hiển thị thông tin cấp bậc trong appointment details

### Payment Service

- Sử dụng `base_price` để tính tổng tiền thanh toán
- Có thể áp dụng discount hoặc surcharge

## Error Handling

| Status Code | Message                | Mô tả                         |
| ----------- | ---------------------- | ----------------------------- |
| 400         | Validation failed      | Dữ liệu đầu vào không hợp lệ  |
| 404         | Doctor level not found | Không tìm thấy cấp bậc bác sĩ |
| 409         | Name already exists    | Tên cấp bậc đã tồn tại        |
| 500         | Server error           | Lỗi server nội bộ             |

## Common Doctor Levels

Danh sách cấp bậc bác sĩ phổ biến trong hệ thống:

### 1. Thực tập sinh

- **base_price**: 100,000 VND
- **description**: Bác sĩ mới tốt nghiệp, đang thực tập

### 2. Bác sĩ đa khoa

- **base_price**: 150,000 VND
- **description**: Bác sĩ tổng quát, kinh nghiệm 1-3 năm

### 3. Chuyên khoa I

- **base_price**: 200,000 VND
- **description**: Bác sĩ chuyên khoa cấp 1, kinh nghiệm 3-7 năm

### 4. Chuyên khoa II

- **base_price**: 350,000 VND
- **description**: Bác sĩ chuyên khoa cấp 2, kinh nghiệm 7-15 năm

### 5. Tiến sĩ

- **base_price**: 400,000 VND
- **description**: Bác sĩ có học vị tiến sĩ

### 6. Phó Giáo sư

- **base_price**: 450,000 VND
- **description**: Bác sĩ cấp phó giáo sư

### 7. Giáo sư

- **base_price**: 500,000 VND
- **description**: Bác sĩ cấp giáo sư, chuyên gia hàng đầu

## Usage Examples

### Tạo cấp bậc mới

```bash
curl -X POST http://localhost:3000/api/v1/doctor_levels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bác sĩ CKI",
    "description": "Bác sĩ chuyên khoa cấp 1",
    "base_price": 200000,
    "isActive": true
  }'
```

### Tìm kiếm cấp bậc

```bash
curl -X GET "http://localhost:3000/api/v1/doctor_levels/search?query=chuyên&page=1&limit=5&sortField=base_price&sortOrder=desc"
```

### Cập nhật mức phí

```bash
curl -X PUT http://localhost:3000/api/v1/doctor_levels/DL123456 \
  -H "Content-Type: application/json" \
  -d '{
    "base_price": 250000
  }'
```

### Vô hiệu hóa cấp bậc

```bash
curl -X PUT http://localhost:3000/api/v1/doctor_levels/DL123456 \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

## Pricing Guidelines

### Factors affecting price:

1. **Experience**: Số năm kinh nghiệm
2. **Education**: Học vị (CK1, CK2, Tiến sĩ, Giáo sư)
3. **Specialty**: Chuyên khoa có thể có multiplier
4. **Reputation**: Rating và đánh giá từ bệnh nhân
5. **Location**: Bệnh viện/khu vực

### Price Range:

- **Min**: 100,000 VND (Thực tập sinh)
- **Max**: 500,000 VND (Giáo sư)
- **Average**: 250,000 VND (Chuyên khoa I-II)

### Future Enhancements:

- Dynamic pricing dựa trên demand
- Seasonal pricing adjustments
- Package deals cho multiple consultations
- Insurance integration
