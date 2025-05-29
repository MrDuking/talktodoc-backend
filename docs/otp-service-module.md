# OTP Service Module Documentation

## Tổng quan

OTP Service Module quản lý việc tạo và xác thực mã OTP (One-Time Password) qua email cho các tính năng như đăng ký tài khoản và đặt lại mật khẩu trong hệ thống TalkToDoc.

## Base URL

```
/api/v1/otp
```

## API Endpoints

### 1. Gửi OTP đăng ký

**POST** `/api/v1/otp/send`

Gửi mã OTP để xác thực email khi đăng ký tài khoản mới.

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
  "message": "OTP mới đã được gửi đến email của bạn",
  "success": true,
  "data": null,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/otp/send"
}
```

#### Response Error - Email đã tồn tại

```json
{
  "statusCode": 400,
  "message": "Email đã tồn tại trong hệ thống",
  "success": false,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/otp/send"
}
```

#### Response Error - OTP còn hiệu lực

```json
{
  "statusCode": 400,
  "message": "OTP vẫn còn hiệu lực, vui lòng kiểm tra email của bạn",
  "success": false,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/otp/send"
}
```

### 2. Gửi OTP đặt lại mật khẩu

**POST** `/api/v1/otp/send-password-reset`

Gửi mã OTP để đặt lại mật khẩu cho tài khoản đã tồn tại.

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
  "message": "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn",
  "success": true,
  "data": null,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/otp/send-password-reset"
}
```

#### Response Error - Email không tồn tại

```json
{
  "statusCode": 400,
  "message": "Email không tồn tại trong hệ thống",
  "success": false,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/otp/send-password-reset"
}
```

### 3. Xác thực OTP

**POST** `/api/v1/otp/verify`

Xác thực mã OTP đã gửi về email.

#### Request Body

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "OTP đã được xác thực thành công",
  "success": true,
  "data": {
    "status": 200
  },
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/otp/verify"
}
```

#### Response Error - OTP không hợp lệ

```json
{
  "statusCode": 400,
  "message": "OTP không hợp lệ",
  "success": false,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/otp/verify"
}
```

#### Response Error - OTP đã hết hạn

```json
{
  "statusCode": 400,
  "message": "OTP đã hết hạn",
  "success": false,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/otp/verify"
}
```

#### Response Error - OTP đã được sử dụng

```json
{
  "statusCode": 400,
  "message": "OTP đã được sử dụng",
  "success": false,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/v1/otp/verify"
}
```

## DTOs

### SendOtpDto

```typescript
export class SendOtpDto {
  email: string // Email người nhận (bắt buộc, định dạng email)
}
```

**Validation:**

- `email`: Phải là email hợp lệ

### VerifyOtpDto

```typescript
export class VerifyOtpDto {
  email: string // Email đã nhận OTP (bắt buộc, định dạng email)
  otp: string // Mã OTP 6 số (bắt buộc)
}
```

**Validation:**

- `email`: Phải là email hợp lệ
- `otp`: Phải là string (6 số)

## Schemas

### EmailOtp Schema

```typescript
export class EmailOtp {
  _id: string // ID tự động tạo
  email: string // Email người nhận
  otp: string // Mã OTP (6 số)
  expiresAt: Date // Thời gian hết hạn
  isVerified: boolean // Trạng thái xác thực (mặc định: false)
  createdAt: Date // Thời gian tạo
  updatedAt: Date // Thời gian cập nhật
}
```

## Business Logic

### OTP Generation

- **Format**: 6 số ngẫu nhiên (100000 - 999999)
- **Hết hạn**: 5 phút sau khi tạo
- **Unique**: Mỗi email chỉ có 1 OTP active tại một thời điểm

### Validation Rules

#### Gửi OTP Đăng ký (`/send`)

1. Kiểm tra email chưa tồn tại trong hệ thống
2. Kiểm tra OTP cũ còn hiệu lực không
3. Nếu email đã được verify → Báo lỗi
4. Tạo OTP mới và gửi email

#### Gửi OTP Đặt lại mật khẩu (`/send-password-reset`)

1. Kiểm tra email đã tồn tại trong hệ thống
2. Xóa OTP cũ (nếu có)
3. Tạo OTP mới và gửi email

#### Xác thực OTP (`/verify`)

1. Tìm OTP theo email và mã
2. Kiểm tra OTP chưa được verify
3. Kiểm tra OTP chưa hết hạn
4. Đánh dấu `isVerified = true`

### Email Integration

Module tích hợp với **Resend** service để gửi email:

#### OTP Registration Template

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
  <h2 style="color: #2E86C1;">Xác thực đăng ký tài khoản</h2>
  <p>Mã OTP của bạn là:</p>
  <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">{OTP}</div>
  <p>Mã này sẽ hết hạn sau <strong>5 phút</strong>.</p>
</div>
```

#### OTP Password Reset Template

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
  <h2 style="color: #2E86C1;">Đặt lại mật khẩu</h2>
  <p>Mã OTP đặt lại mật khẩu của bạn là:</p>
  <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">{OTP}</div>
  <p>Mã này sẽ hết hạn sau <strong>5 phút</strong>.</p>
</div>
```

### Database Operations

- **Upsert**: Sử dụng `findOneAndUpdate` với `upsert: true`
- **Auto-cleanup**: OTP hết hạn sẽ được cleanup tự động
- **Indexing**: Index trên `email` và `expiresAt`

## Security Features

### Rate Limiting

- Giới hạn số lần gửi OTP: 5 lần/email/15 phút
- Giới hạn số lần verify: 10 lần/email/5 phút

### Data Protection

- OTP được hash trước khi lưu database (tùy chọn)
- Email validation nghiêm ngặt
- Tự động xóa OTP sau khi verify thành công

### Anti-Spam

- Cooldown giữa các lần gửi: 60 giây
- Validate email format và domain
- Block disposable email providers

## Error Handling

| Status Code | Message                                 | Mô tả                  |
| ----------- | --------------------------------------- | ---------------------- |
| 400         | Email đã tồn tại trong hệ thống         | Email đã được đăng ký  |
| 400         | Email không tồn tại trong hệ thống      | Email chưa đăng ký     |
| 400         | Email đã được xác thực                  | OTP đã verify trước đó |
| 400         | OTP vẫn còn hiệu lực                    | Chờ OTP cũ hết hạn     |
| 400         | OTP không hợp lệ                        | Sai mã OTP             |
| 400         | OTP đã hết hạn                          | OTP quá 5 phút         |
| 400         | OTP đã được sử dụng                     | OTP đã verify rồi      |
| 500         | Không thể gửi OTP, vui lòng thử lại sau | Lỗi email service      |

## Integration với Auth Module

### Registration Flow

1. User gửi thông tin đăng ký
2. System gửi OTP qua `/otp/send`
3. User nhập OTP và verify qua `/otp/verify`
4. Auth module tạo tài khoản sau khi OTP verified

### Password Reset Flow

1. User quên mật khẩu, nhập email
2. System gửi OTP qua `/otp/send-password-reset`
3. User nhập OTP và verify
4. Auth module cho phép đặt mật khẩu mới

## Environment Variables

```env
RESEND_API_KEY=re_xxxxxxxxxx  # API key từ Resend.com
```

## Usage Examples

### Gửi OTP đăng ký

```bash
curl -X POST http://localhost:3000/api/v1/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com"
  }'
```

### Gửi OTP đặt lại mật khẩu

```bash
curl -X POST http://localhost:3000/api/v1/otp/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existinguser@example.com"
  }'
```

### Xác thực OTP

```bash
curl -X POST http://localhost:3000/api/v1/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

## Testing

### Unit Tests

- Test OTP generation (6 digits)
- Test expiration logic (5 minutes)
- Test email validation
- Test duplicate OTP handling

### Integration Tests

- Test email sending flow
- Test database operations
- Test error scenarios
- Test concurrent requests

### Manual Testing

```javascript
// Test OTP generation
const otp = randomInt(100000, 999999).toString()
console.log(otp.length === 6) // true

// Test expiration
const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
console.log(expiresAt > new Date()) // true
```
