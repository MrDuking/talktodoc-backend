# Mail Module Documentation

## Tổng quan

Mail Module quản lý việc gửi email thông qua dịch vụ Resend với hệ thống template sử dụng Handlebars. Module này tự động ghi log tất cả email đã gửi và lỗi xảy ra.

## API Endpoints

### 1. Gửi Email theo Template

**POST** `/mail/send-template`

Gửi email sử dụng template HTML có sẵn với các biến động.

#### Request Body

```json
{
  "to": "user@example.com",
  "subject": "Lịch hẹn xác nhận",
  "template": "appointment-confirmation",
  "variables": {
    "name": "Nguyễn Văn Thiện",
    "doctor": "BS. Lê Văn A",
    "date": "2025-04-20",
    "slot": "09:00-10:00"
  }
}
```

#### Response thành công

```json
{
  "statusCode": 200,
  "message": "Email sent using template",
  "success": true,
  "data": null,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/mail/send-template"
}
```

#### Response lỗi

```json
{
  "statusCode": 400,
  "message": "Template 'invalid-template' not found",
  "success": false,
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/mail/send-template"
}
```

## DTOs

### MailTemplateDto

```typescript
export class MailTemplateDto {
  to: string // Email người nhận (bắt buộc, định dạng email)
  subject: string // Tiêu đề email (bắt buộc)
  template: string // Tên template (bắt buộc, không cần .html)
  variables: Record<string, any> // Biến truyền vào template (object)
}
```

**Validation:**

- `to`: Phải là email hợp lệ
- `subject`: Không được rỗng
- `template`: Không được rỗng, phải tồn tại trong thư mục templates
- `variables`: Phải là object, chứa dữ liệu để render template

## Schemas

### EmailLog Schema

```typescript
export class EmailLog {
  _id: string // ID tự động tạo
  to: string // Email người nhận
  subject: string // Tiêu đề email
  html?: string // Nội dung HTML đã render
  success: boolean // Trạng thái gửi (mặc định: true)
  errorMessage?: string // Thông báo lỗi (nếu có)
  createdAt: Date // Thời gian tạo
  updatedAt: Date // Thời gian cập nhật
}
```

## Templates có sẵn

Module có sẵn 13 template email:

### 1. Lịch hẹn

- `appointment-confirmation` - Xác nhận lịch hẹn chung
- `appointment-confirm-patient` - Xác nhận từ bệnh nhân
- `appointment-confirm-doctor` - Xác nhận từ bác sĩ
- `appointment-cancel-patient` - Hủy lịch từ bệnh nhân
- `appointment-cancel-doctor` - Hủy lịch từ bác sĩ
- `appointment-reject-patient` - Từ chối từ bệnh nhân
- `appointment-reject-doctor` - Từ chối từ bác sĩ

### 2. Bác sĩ

- `doctor-request` - Yêu cầu đăng ký bác sĩ
- `new-doctor-request` - Yêu cầu đăng ký mới
- `doctor-update-request` - Yêu cầu cập nhật thông tin
- `doctor-approval-result` - Kết quả phê duyệt
- `doctor-confirm` - Xác nhận bác sĩ
- `doctor-reject` - Từ chối bác sĩ

## Biến template thông dụng

### Appointment Templates

```json
{
  "name": "Tên bệnh nhân",
  "doctor": "Tên bác sĩ",
  "date": "2025-04-20",
  "slot": "09:00-10:00",
  "appointmentId": "APP-123456",
  "reason": "Lý do hủy/từ chối"
}
```

### Doctor Templates

```json
{
  "doctorName": "Tên bác sĩ",
  "specialty": "Chuyên khoa",
  "hospital": "Bệnh viện",
  "phone": "Số điện thoại",
  "status": "approved/rejected",
  "approvalDate": "2025-01-15",
  "loginUrl": "https://talktodoc.online/login"
}
```

## Cấu hình

### Environment Variables

```env
RESEND_API_KEY=re_xxxxxxxxxx  # API key từ Resend.com
```

### Template System

- **Engine**: Handlebars
- **Location**: `src/modules/mail/templates/`
- **Format**: HTML với Handlebars syntax
- **Extension**: `.html`

## Tích hợp với Resend

Module sử dụng [Resend](https://resend.com) làm service provider:

### Headers

```
Authorization: Bearer ${RESEND_API_KEY}
Content-Type: application/json
```

### From Address

```
noreply@talktodoc.online
```

## Error Handling

### Template Errors

- Template không tồn tại → HTTP 400
- Syntax lỗi trong template → HTTP 500
- Variables thiếu → Render với giá trị rỗng

### Email Service Errors

- API key không hợp lệ → HTTP 401 từ Resend
- Email không hợp lệ → HTTP 400 từ Resend
- Rate limit exceeded → HTTP 429 từ Resend

### Logging

- Tất cả email (thành công/lỗi) đều được log vào MongoDB
- Logger ghi chi tiết lỗi vào console
- Lưu trữ HTML content để debug

## Business Logic

### Email Flow

1. Validate input DTO
2. Kiểm tra template tồn tại
3. Render template với variables
4. Gửi qua Resend API
5. Log kết quả vào database
6. Return response

### Template Rendering

- Sử dụng Handlebars compile
- Hỗ trợ loops, conditions, helpers
- Variables được inject vào template
- HTML được escape tự động

## Security Features

- Input validation với class-validator
- Email address validation
- Template path validation (không cho ../.. injection)
- Error message sanitization
- API key được bảo vệ trong environment

## Usage Examples

### Gửi email xác nhận lịch hẹn

```typescript
const mailDto = {
  to: 'patient@example.com',
  subject: 'Xác nhận lịch hẹn',
  template: 'appointment-confirmation',
  variables: {
    name: 'Nguyễn Văn A',
    doctor: 'BS. Trần Thị B',
    date: '2025-01-20',
    slot: '14:00-15:00',
    appointmentId: 'APP-789123',
  },
}
```

### Gửi email phê duyệt bác sĩ

```typescript
const mailDto = {
  to: 'doctor@example.com',
  subject: 'Kết quả phê duyệt hồ sơ bác sĩ',
  template: 'doctor-approval-result',
  variables: {
    doctorName: 'BS. Lê Văn C',
    status: 'approved',
    approvalDate: '2025-01-15',
    loginUrl: 'https://talktodoc.online/doctor/login',
  },
}
```
