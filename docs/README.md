# TalkToDoc API Documentation

Tài liệu API cho hệ thống TalkToDoc - Nền tảng tư vấn sức khỏe trực tuyến.

## Tổng quan

TalkToDoc là một hệ thống backend được xây dựng bằng NestJS, cung cấp các API để quản lý:

- Đặt lịch hẹn với bác sĩ
- Tư vấn sức khỏe qua chat AI
- Quản lý bệnh án và đơn thuốc
- Thanh toán và ví điện tử
- Quản lý người dùng (bệnh nhân, bác sĩ, nhân viên)

## Cấu trúc API

### Modules chính

1. **[Auth Module](./auth-module.md)** - Xác thực và phân quyền
2. **[User Service](./user-service-module.md)** - Quản lý người dùng
3. **[Appointments Service](./appointments-service-module.md)** - Quản lý lịch hẹn
4. **[Case Module](./case-module.md)** - Quản lý bệnh án
5. **[Chat Bot Service](./chat-bot-service-module.md)** - Tư vấn AI
6. **[Payment Service](./payment-service-module.md)** - Thanh toán VNPay
7. **[Mail Module](./mail-module.md)** - Gửi email
8. **[OTP Service](./otp-service-module.md)** - Xác thực OTP
9. **[Specialty Service](./specialty-service-module.md)** - Quản lý chuyên khoa
10. **[Doctor Levels Service](./doctor-levels-service-module.md)** - Quản lý cấp bậc bác sĩ
11. **[Hospitals Service](./hospitals-service-module.md)** - Quản lý bệnh viện
12. **[Pharmacy Service](./pharmacy-service-module.md)** - Quản lý nhà thuốc
13. **[Medicines Service](./medicines-service-module.md)** - Quản lý thuốc
14. **[Contact Service](./contact-service-module.md)** - Liên hệ hỗ trợ
15. **[Form Config Service](./form-config-service-module.md)** - Cấu hình form
16. **[Stringee Service](./stringee-service-module.md)** - Video call

## Response Format chuẩn

Tất cả API đều tuân theo format response thống nhất:

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    // Dữ liệu trả về
  },
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

### Response cho danh sách (List/Pagination)

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 10
  },
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

### Response lỗi

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "success": false,
  "errors": {
    "field": "error message"
  },
  "timestamp": "2025-01-14T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

## Authentication

### Bearer Token

Hầu hết API yêu cầu authentication qua JWT token:

```
Authorization: Bearer <jwt_token>
```

### Roles

- `PATIENT` - Bệnh nhân
- `DOCTOR` - Bác sĩ
- `EMPLOYEE` - Nhân viên
- `ADMIN` - Quản trị viên

## Base URL

```
Development: http://localhost:3000
Production: https://api.talktodoc.online
```

## Swagger Documentation

```
http://localhost:3000/api/docs
```

## Liên hệ

- Email: support@talktodoc.online
- Website: https://www.talktodoc.online
