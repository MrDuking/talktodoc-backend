# Auth Module Documentation

Module xác thực và phân quyền người dùng trong hệ thống TalkToDoc.

## Base URL

```
/auth
```

## Endpoints

### 1. Đăng nhập

**POST** `/auth/login`

Đăng nhập vào hệ thống với username/email/phone và password.

#### Request Body

```json
{
  "identifier": "string", // Username, email hoặc phone number
  "password": "string" // Mật khẩu (tối thiểu 6 ký tự)
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "6405f7d2e4b0b7a7c8d9e0f1",
      "username": "dukuser",
      "email": "duk@example.com",
      "fullName": "Duk Nguyen",
      "role": "PATIENT",
      "isActive": true
    }
  }
}
```

#### Response Error

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "success": false
}
```

### 2. Đăng ký

**POST** `/auth/register`

Đăng ký tài khoản mới cho bệnh nhân.

#### Request Body

```json
{
  "username": "string", // Tên đăng nhập
  "email": "string", // Email (phải unique)
  "phoneNumber": "string", // SĐT (10-11 số)
  "password": "string" // Mật khẩu (tối thiểu 6 ký tự)
}
```

#### Response Success

```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "username": "newuser",
    "email": "newuser@example.com",
    "phoneNumber": "0987654321",
    "role": "PATIENT",
    "isActive": true,
    "createdAt": "2025-01-14T10:30:00.000Z"
  }
}
```

### 3. Quên mật khẩu

**POST** `/auth/forgot-password`

Gửi OTP đến email để reset mật khẩu.

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "OTP sent to your email",
  "success": true,
  "data": null
}
```

### 4. Reset mật khẩu

**POST** `/auth/reset-password`

Reset mật khẩu với OTP đã gửi.

#### Request Body

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Password reset successfully",
  "success": true,
  "data": null
}
```

### 5. Đăng xuất

**POST** `/auth/logout`

Đăng xuất khỏi hệ thống.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Logout successful",
  "success": true,
  "data": null
}
```

## DTOs/Schemas

### LoginDto

```typescript
{
  identifier: string // Username, email hoặc phone
  password: string // Mật khẩu (min: 6 ký tự)
}
```

### RegisterUserDto

```typescript
{
  username: string // Tên đăng nhập
  email: string // Email
  phoneNumber: string // SĐT (regex: /^[0-9]{10,11}$/)
  password: string // Mật khẩu
}
```

### ForgotPasswordDto

```typescript
{
  email: string // Email đăng ký
}
```

### ResetPasswordDto

```typescript
{
  email: string // Email đăng ký
  otp: string // Mã OTP 6 số
  newPassword: string // Mật khẩu mới (min: 6 ký tự)
}
```

### JwtPayload

```typescript
{
  userId: string
  username: string
  role: 'PATIENT' | 'DOCTOR' | 'EMPLOYEE' | 'ADMIN'
}
```

## Guards & Decorators

### JwtAuthGuard

Bảo vệ endpoints cần authentication.

```typescript
@UseGuards(JwtAuthGuard)
```

### RolesGuard

Bảo vệ endpoints theo vai trò.

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR', 'ADMIN')
```

### @Roles Decorator

Chỉ định roles được phép truy cập.

```typescript
@Roles('DOCTOR')        // Chỉ bác sĩ
@Roles('ADMIN')         // Chỉ admin
@Roles('DOCTOR', 'ADMIN') // Bác sĩ hoặc admin
```

## Error Codes

| Status Code | Message                 | Mô tả                        |
| ----------- | ----------------------- | ---------------------------- |
| 400         | Validation failed       | Dữ liệu đầu vào không hợp lệ |
| 401         | Invalid credentials     | Sai username/password        |
| 401         | Unauthorized            | Chưa đăng nhập               |
| 403         | Forbidden               | Không có quyền truy cập      |
| 409         | Email already exists    | Email đã được sử dụng        |
| 409         | Username already exists | Username đã được sử dụng     |

## Security Features

- **JWT Token**: Access token có thời hạn
- **Password Hashing**: Sử dụng bcrypt
- **Rate Limiting**: Giới hạn số lần thử đăng nhập
- **Email Verification**: Xác thực OTP qua email
- **Role-based Access**: Phân quyền theo vai trò

## Examples

### Đăng nhập thành công

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "duk@example.com",
    "password": "password123"
  }'
```

### Sử dụng JWT token

```bash
curl -X GET http://localhost:3000/appointments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
