# User Service Module Documentation

Module quản lý người dùng trong hệ thống TalkToDoc bao gồm bệnh nhân, bác sĩ, nhân viên.

## Base URLs

### Patients

```
/patients
```

### Doctors

```
/doctors
```

### Employees

```
/employees
```

## Patient APIs

### 1. Lấy danh sách bệnh nhân

**GET** `/patients`

#### Query Parameters

- `query` (optional): Tìm kiếm theo tên, email, SĐT
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
    "data": [
      {
        "_id": "6405f7d2e4b0b7a7c8d9e0f1",
        "username": "patient123",
        "email": "patient@example.com",
        "fullName": "Nguyễn Văn A",
        "phoneNumber": "0987654321",
        "gender": "male",
        "birthDate": "1990-01-01T00:00:00.000Z",
        "address": "123 Đường ABC",
        "walletBalance": 50000,
        "isActive": true,
        "createdAt": "2025-01-14T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 2. Tạo bệnh nhân mới

**POST** `/patients`

#### Request Body

```json
{
  "username": "patient123",
  "password": "password123",
  "email": "patient@example.com",
  "fullName": "Nguyễn Văn A",
  "birthDate": "1990-01-01",
  "gender": "male",
  "phoneNumber": "0987654321",
  "address": "123 Đường ABC",
  "city": {
    "name": "Hà Nội",
    "code": 1,
    "division_type": "City",
    "codename": "ha_noi",
    "phone_code": 24
  },
  "medicalHistory": [
    {
      "condition": "Cao huyết áp",
      "diagnosisDate": "2020-01-01",
      "treatment": "Thuốc hạ áp"
    }
  ]
}
```

### 3. Cập nhật thông tin bệnh nhân

**PATCH** `/patients/:id`

### 4. Xóa bệnh nhân

**DELETE** `/patients/:id`

## Doctor APIs

### 1. Lấy danh sách bác sĩ

**GET** `/doctors`

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": [
    {
      "_id": "6405f7d2e4b0b7a7c8d9e0f1",
      "username": "doctor123",
      "email": "doctor@example.com",
      "fullName": "BS. Nguyễn Văn B",
      "phoneNumber": "0987654321",
      "specialty": [
        {
          "_id": "6405f7d2e4b0b7a7c8d9e0f2",
          "name": "Tim mạch"
        }
      ],
      "hospital": {
        "_id": "6405f7d2e4b0b7a7c8d9e0f3",
        "name": "Bệnh viện Bach Mai"
      },
      "experienceYears": 10,
      "licenseNo": "MD123456",
      "rank": {
        "_id": "6405f7d2e4b0b7a7c8d9e0f4",
        "name": "Chuyên khoa I",
        "base_price": 200000
      },
      "avgScore": 4.5,
      "registrationStatus": "approved",
      "availability": [
        {
          "dayOfWeek": 1,
          "timeSlot": [
            {
              "index": 0,
              "timeStart": "08:00",
              "timeEnd": "12:00"
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. Tạo bác sĩ mới

**POST** `/doctors`

#### Request Body

```json
{
  "username": "doctor123",
  "password": "password123",
  "email": "doctor@example.com",
  "fullName": "BS. Nguyễn Văn B",
  "birthDate": "1980-01-01",
  "phoneNumber": "0987654321",
  "specialty": ["6405f7d2e4b0b7a7c8d9e0f2"],
  "hospital": "6405f7d2e4b0b7a7c8d9e0f3",
  "experienceYears": 10,
  "licenseNo": "MD123456",
  "rank": "6405f7d2e4b0b7a7c8d9e0f4",
  "position": "Trưởng khoa",
  "registrationForm": {
    "practicingCertificate": "link_to_certificate",
    "degree": "link_to_degree",
    "cv": "link_to_cv",
    "otherCertificates": ["link1", "link2"]
  }
}
```

### 3. Đánh giá bác sĩ

**POST** `/doctors/:id/rating`

#### Request Body

```json
{
  "appointmentId": "6405f7d2e4b0b7a7c8d9e0f5",
  "ratingScore": 5,
  "description": "Bác sĩ tư vấn rất tốt"
}
```

### 4. Cài đặt lịch làm việc

**PATCH** `/doctors/:id/availability`

#### Request Body

```json
{
  "availability": [
    {
      "dayOfWeek": 1,
      "timeSlot": [
        {
          "index": 0,
          "timeStart": "08:00",
          "timeEnd": "12:00"
        },
        {
          "index": 1,
          "timeStart": "13:00",
          "timeEnd": "17:00"
        }
      ]
    }
  ]
}
```

### 5. Migrate trạng thái đăng ký

**GET** `/doctors/migrate-registration-status`

Chuyển tất cả bác sĩ về trạng thái PENDING.

## Employee APIs

### 1. Lấy danh sách nhân viên

**GET** `/employees`

### 2. Tạo nhân viên mới

**POST** `/employees`

#### Request Body

```json
{
  "username": "employee123",
  "password": "password123",
  "email": "employee@example.com",
  "fullName": "Nguyễn Văn C",
  "position": "Tư vấn viên",
  "department": "Khám bệnh",
  "specialty": ["6405f7d2e4b0b7a7c8d9e0f2"],
  "startDate": "2025-01-01",
  "phoneNumber": "0987654321",
  "salary": 15000000,
  "contractType": "Full-time"
}
```

## Schemas

### Patient Schema

```typescript
{
  _id: ObjectId;
  username: string;
  password: string;        // Được hash
  email: string;
  fullName: string;
  phoneNumber: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  city?: {
    name: string;
    code: number;
    division_type: string;
    codename: string;
    phone_code: number;
  };
  medicalHistory: {
    condition: string;
    diagnosisDate: Date;
    treatment: string;
  }[];
  walletBalance: number;    // Số dư ví
  walletHistory: {
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAW' | 'REFUND';
    description: string;
    createdAt: Date;
  }[];
  isActive: boolean;
  role: 'PATIENT';
  createdAt: Date;
  updatedAt: Date;
}
```

### Doctor Schema

```typescript
{
  _id: ObjectId;
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  birthDate: Date;
  specialty: ObjectId[];    // Reference to Specialty
  hospital: ObjectId;       // Reference to Hospital
  experienceYears: number;
  licenseNo: string;
  availability: {
    dayOfWeek?: number;     // 0=CN, 1=T2,...,6=T7
    timeSlot: {
      index: number;
      timeStart: string;    // "08:00"
      timeEnd: string;      // "12:00"
    }[];
  }[];
  rank: ObjectId;          // Reference to DoctorLevel
  position?: string;
  ratingDetails: {
    ratingScore: number;
    description?: string;
    appointmentId?: ObjectId;
  }[];
  avgScore: number;        // Điểm đánh giá trung bình
  registrationStatus: 'pending' | 'approved' | 'rejected' | 'updating';
  registrationForm?: {
    practicingCertificate: string;
    degree: string;
    cv: string;
    otherCertificates?: string[];
    submittedAt: Date;
  };
  wallet?: {
    balance?: number;
    transactionHistory?: {
      amount: number;
      type: 'DEPOSIT' | 'WITHDRAW' | 'REFUND';
      description: string;
      createdAt: Date;
    }[];
    lastUpdated?: Date;
  };
  isActive: boolean;
  role: 'DOCTOR';
  createdAt: Date;
  updatedAt: Date;
}
```

### Employee Schema

```typescript
{
  _id: ObjectId;
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  position: string;
  department?: string;
  specialty: ObjectId[];    // Reference to Specialty
  startDate: Date;
  salary?: number;
  contractType?: string;
  isActive: boolean;
  role: 'EMPLOYEE';
  createdAt: Date;
  updatedAt: Date;
}
```

## Enums

### UserRole

```typescript
enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
}
```

### DoctorRegistrationStatus

```typescript
enum DoctorRegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UPDATING = 'updating',
}
```

### Gender

```typescript
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
```

## Wallet System

### Cập nhật số dư ví

**Method**: `updateWalletBalance(userId, amount, type, description)`

#### Parameters

- `userId`: ID người dùng
- `amount`: Số tiền (VND)
- `type`: 'DEPOSIT' | 'WITHDRAW' | 'REFUND'
- `description`: Mô tả giao dịch

#### Example Usage

```typescript
// Nạp tiền
await usersService.updateWalletBalance(
  '6405f7d2e4b0b7a7c8d9e0f1',
  100000,
  'DEPOSIT',
  'Nạp tiền vào ví',
)

// Hoàn tiền
await usersService.updateWalletBalance(
  '6405f7d2e4b0b7a7c8d9e0f1',
  50000,
  'REFUND',
  'Hoàn tiền từ lịch hẹn bị hủy',
)
```

## Search & Pagination

Tất cả API list đều hỗ trợ:

- **Search**: Tìm kiếm theo tên, email, SĐT
- **Pagination**: `page`, `limit`
- **Sorting**: `sortField`, `sortOrder`

### Example Search Request

```bash
GET /patients?query=nguyen&page=1&limit=10&sortField=fullName&sortOrder=asc
```

## Error Handling

| Status Code | Message                 | Mô tả                        |
| ----------- | ----------------------- | ---------------------------- |
| 400         | Validation failed       | Dữ liệu đầu vào không hợp lệ |
| 404         | User not found          | Không tìm thấy người dùng    |
| 409         | Email already exists    | Email đã tồn tại             |
| 409         | Username already exists | Username đã tồn tại          |
