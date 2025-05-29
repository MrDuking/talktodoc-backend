# Payment Service Module Documentation

Module quản lý thanh toán VNPay trong hệ thống TalkToDoc, hỗ trợ tạo URL thanh toán và xử lý callback.

## Base URL

```
/payment
```

## Endpoints

### 1. Tạo URL thanh toán

**POST** `/payment/create-payment-url`

Tạo URL thanh toán VNPay cho lịch hẹn.

#### Request Body

```json
{
  "patient": "6405f7d2e4b0b7a7c8d9e0f1",
  "doctorId": "6405f7d2e4b0b7a7c8d9e0f2",
  "appointmentId": "6405f7d2e4b0b7a7c8d9e0f3",
  "amount": 199000
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Payment URL created successfully",
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=19900000&vnp_Command=pay&vnp_CreateDate=20250114103000&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+lich+hen%3A+2503231234567&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fpayment%2Fvnpay-callback&vnp_TmnCode=VNPAYTEST&vnp_TxnRef=2503231234567&vnp_Version=2.1.0&vnp_SecureHash=abc123..."
  }
}
```

### 2. Xử lý callback VNPay

**POST** `/payment/vnpay-callback`

Xử lý phản hồi từ VNPay sau khi thanh toán.

#### Request Body

```json
{
  "vnp_TxnRef": "2503231234567",
  "vnp_ResponseCode": "00",
  "vnp_SecureHash": "abc123...",
  "vnp_Amount": 19900000,
  "vnp_OrderInfo": "Thanh toan lich hen: 2503231234567"
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Payment successful, appointment updated",
  "success": true,
  "data": {
    "success": true,
    "message": "Payment successful, appointment updated",
    "orderId": "2503231234567",
    "patient": "6405f7d2e4b0b7a7c8d9e0f1"
  }
}
```

#### Response Error - Payment Failed

```json
{
  "statusCode": 400,
  "message": "Payment failed",
  "success": false,
  "data": {
    "success": false,
    "message": "Payment failed",
    "orderId": "2503231234567"
  }
}
```

### 3. Lấy lịch sử thanh toán

**GET** `/payment/history/:patient`

Lấy lịch sử thanh toán của bệnh nhân.

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": [
    {
      "orderId": "2503231234567",
      "amount": 199000,
      "status": "completed",
      "createdAt": "2025-01-14T10:30:00.000Z",
      "completedAt": "2025-01-14T10:35:00.000Z",
      "user": {
        "name": "Nguyễn Văn A",
        "email": "patient@example.com"
      }
    },
    {
      "orderId": "2503231234568",
      "amount": 299000,
      "status": "pending",
      "createdAt": "2025-01-14T11:00:00.000Z",
      "user": {
        "name": "Nguyễn Văn A",
        "email": "patient@example.com"
      }
    }
  ]
}
```

### 4. Xem chi tiết đơn hàng

**GET** `/payment/order/:orderId`

Xem chi tiết thông tin đơn hàng.

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    "orderId": "2503231234567",
    "amount": 199000,
    "status": "completed",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "completedAt": "2025-01-14T10:35:00.000Z",
    "user": {
      "name": "Nguyễn Văn A",
      "email": "patient@example.com"
    }
  }
}
```

### 5. Lấy tất cả đơn hàng (Admin)

**GET** `/payment/orders`

Lấy danh sách tất cả đơn hàng trong hệ thống.

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": [
    {
      "orderId": "2503231234567",
      "patient": "6405f7d2e4b0b7a7c8d9e0f1",
      "amount": 199000,
      "status": "completed",
      "createdAt": "2025-01-14T10:30:00.000Z",
      "completedAt": "2025-01-14T10:35:00.000Z",
      "userInfo": {
        "_id": "6405f7d2e4b0b7a7c8d9e0f1",
        "fullName": "Nguyễn Văn A",
        "email": "patient@example.com"
      },
      "appointmentInfo": {
        "_id": "6405f7d2e4b0b7a7c8d9e0f3",
        "appointmentId": "AP123456",
        "date": "2025-04-20",
        "slot": "09:00-10:00",
        "status": "CONFIRMED"
      },
      "doctorInfo": {
        "_id": "6405f7d2e4b0b7a7c8d9e0f2",
        "fullName": "BS. Nguyễn Văn B",
        "email": "doctor@example.com",
        "specialty": {
          "_id": "6405f7d2e4b0b7a7c8d9e0f4",
          "name": "Tim mạch"
        }
      }
    }
  ]
}
```

## Schemas

### OrderMapping Schema

```typescript
{
  _id: ObjectId;
  orderId: string;           // Mã đơn hàng unique
  patient: string;           // ID bệnh nhân
  doctorId?: string;         // ID bác sĩ (optional)
  appointmentId?: string;    // ID lịch hẹn (optional)
  amount: number;            // Số tiền (VND)
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;           // Thời gian tạo
  completedAt?: Date;        // Thời gian hoàn thành
}
```

### PaymentRequestDto

```typescript
{
  patient: string;           // ID bệnh nhân (required)
  doctorId?: string;         // ID bác sĩ (optional)
  appointmentId?: string;    // ID lịch hẹn (optional)
  amount: number;            // Số tiền (min: 10,000 VND)
}
```

### PaymentCallbackDto

```typescript
{
  vnp_TxnRef: string;        // Mã giao dịch
  vnp_ResponseCode: string;  // Mã phản hồi (00 = thành công)
  vnp_SecureHash: string;    // Hash bảo mật
  vnp_Amount?: number;       // Số tiền (x100)
  vnp_OrderInfo?: string;    // Thông tin đơn hàng
}
```

## VNPay Integration

### Configuration

```typescript
{
  vnp_TmnCode: string // Mã website merchant
  vnp_HashSecret: string // Khóa bí mật
  vnp_Url: string // URL VNPay
  vnp_ReturnUrl: string // URL return
  vnp_IpnUrl: string // URL IPN
}
```

### Payment URL Generation

1. Tạo orderId unique (timestamp format)
2. Lưu mapping vào database
3. Tạo VNPay parameters
4. Sort và hash parameters
5. Tạo URL thanh toán

### Callback Processing

1. Verify secure hash
2. Kiểm tra response code
3. Cập nhật order status
4. Cập nhật appointment payment
5. Gửi email thông báo

## Business Logic

### Order ID Generation

- Format: `{year}{month}{day}{hour}{minute}{second}`
- Example: `20250114103045`
- Đảm bảo unique trong thời gian

### Payment Flow

1. **Tạo URL**: Patient request → Tạo order mapping → Generate VNPay URL
2. **Thanh toán**: User thanh toán qua VNPay
3. **Callback**: VNPay gửi kết quả → Verify → Update order & appointment
4. **Notification**: Gửi email thông báo kết quả

### Status Management

- `pending`: Chờ thanh toán
- `completed`: Thanh toán thành công
- `failed`: Thanh toán thất bại

### Integration với Appointment

Khi thanh toán thành công:

- Cập nhật `appointment.payment.status = "PAID"`
- Cập nhật thông tin payment trong appointment
- Gửi email xác nhận thanh toán

## Error Handling

| Status Code | Message                | Mô tả                    |
| ----------- | ---------------------- | ------------------------ |
| 400         | Invalid payment amount | Số tiền không hợp lệ     |
| 400         | Payment failed         | Thanh toán thất bại      |
| 404         | Order not found        | Không tìm thấy đơn hàng  |
| 404         | Patient not found      | Không tìm thấy bệnh nhân |
| 404         | Appointment not found  | Không tìm thấy lịch hẹn  |
| 500         | VNPay service error    | Lỗi dịch vụ VNPay        |

## VNPay Response Codes

| Code | Meaning                 | Action              |
| ---- | ----------------------- | ------------------- |
| 00   | Successful              | Cập nhật thành công |
| 07   | Trừ tiền thành công     | Cập nhật thành công |
| 09   | Giao dịch không tồn tại | Báo lỗi             |
| 10   | Khách hàng xác thực sai | Báo lỗi             |
| 11   | Đã hết hạn              | Báo lỗi             |
| 12   | Thẻ bị khóa             | Báo lỗi             |
| 24   | Khách hàng hủy          | Báo lỗi             |

## Security Features

### Hash Verification

- Sử dụng HMAC SHA512
- Verify mọi callback từ VNPay
- Reject invalid signatures

### IP Whitelist

- Chỉ accept callback từ VNPay IPs
- Validate request origin

### Amount Validation

- Minimum: 10,000 VND
- Validate amount trong callback
- So sánh với stored order

## Examples

### Tạo URL thanh toán

```bash
curl -X POST http://localhost:3000/payment/create-payment-url \
  -H "Content-Type: application/json" \
  -d '{
    "patient": "6405f7d2e4b0b7a7c8d9e0f1",
    "appointmentId": "6405f7d2e4b0b7a7c8d9e0f3",
    "amount": 199000
  }'
```

### Xử lý callback (từ VNPay)

```bash
curl -X POST http://localhost:3000/payment/vnpay-callback \
  -H "Content-Type: application/json" \
  -d '{
    "vnp_TxnRef": "2503231234567",
    "vnp_ResponseCode": "00",
    "vnp_Amount": 19900000,
    "vnp_SecureHash": "abc123..."
  }'
```

### Lấy lịch sử thanh toán

```bash
curl -X GET http://localhost:3000/payment/history/6405f7d2e4b0b7a7c8d9e0f1 \
  -H "Authorization: Bearer <token>"
```

## Testing

### Sandbox Environment

- URL: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- Test cards được cung cấp bởi VNPay
- Không có giao dịch thật

### Test Cards

```
Thẻ ATM nội địa:
- Số thẻ: 9704198526191432198
- Tên chủ thẻ: NGUYEN VAN A
- Ngày phát hành: 07/15
- Mật khẩu OTP: 123456

Thẻ VISA:
- Số thẻ: 4111111111111111
- Tên chủ thẻ: NGUYEN VAN A
- Ngày hết hạn: 12/25
- CVV: 123
```
