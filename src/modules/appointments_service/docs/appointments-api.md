# Tài liệu API Lịch hẹn (Appointments)

## Tổng quan

Module này cung cấp các API để quản lý lịch hẹn giữa bệnh nhân và bác sĩ, bao gồm tạo, lấy danh sách, chi tiết, cập nhật, xác nhận, từ chối và xoá lịch hẹn.

---

## 1. Tạo mới lịch hẹn (HỖ TRỢ THANH TOÁN BẰNG VÍ)

- **Endpoint:** `POST /appointments`
- **Yêu cầu xác thực:** Bearer Token (bệnh nhân)
- **Request Body:**

```json
{
  "case_id": "string (MongoId)",
  "specialty": "string (MongoId)",
  "doctor": "string (MongoId)",
  "date": "YYYY-MM-DD",
  "slot": "string (ví dụ: 09:00-09:30)",
  "timezone": "Asia/Ho_Chi_Minh",
  "paymentMethod": "WALLET | VNPAY", // BẮT BUỘC nếu dùng ví
  "payment": {
    "total": 300000, // BẮT BUỘC nếu dùng ví
    "platformFee": 50000,
    "doctorFee": 250000,
    "discount": 0
  }
}
```

### Hướng dẫn FE:

- Nếu user chọn thanh toán bằng ví (`paymentMethod: 'WALLET'`):
  - **BẮT BUỘC** truyền đủ trường `payment.total` (và các trường phí nếu có).
  - FE nên kiểm tra số dư ví trước khi gọi API (nếu có thể), hoặc handle lỗi trả về từ BE.
- Nếu chọn `paymentMethod: 'VNPAY'`, giữ nguyên flow cũ.

### Quy trình BE khi thanh toán bằng ví:

1. Kiểm tra số dư ví bệnh nhân.
2. Nếu đủ tiền, tự động trừ tiền và tạo giao dịch.
3. Nếu không đủ tiền, trả về lỗi 400.
4. Trả về appointment với payment.status = 'PAID', paymentMethod = 'WALLET'.

- **Response (thanh toán ví thành công):**

```json
{
  "_id": "string",
  "appointmentId": "string",
  "patient": "string",
  "doctor": "string",
  "specialty": "string",
  "date": "YYYY-MM-DD",
  "slot": "string",
  "timezone": "string",
  "status": "PENDING",
  "payment": {
    "platformFee": 50000,
    "doctorFee": 250000,
    "discount": 0,
    "total": 300000,
    "status": "PAID",
    "paymentMethod": "WALLET"
  }
}
```

#### Giải thích các field:

- `paymentMethod`: Phương thức thanh toán, FE truyền lên là 'WALLET' hoặc 'VNPAY'.
- `payment.status`: 'PAID' nếu đã trừ tiền ví thành công, 'UNPAID' nếu chờ thanh toán qua VNPAY.
- `total`: Số tiền đã trừ khỏi ví (nếu dùng ví).

#### Lỗi thường gặp FE cần handle:

- 400: Thiếu trường bắt buộc, dữ liệu không hợp lệ, **hoặc số dư ví không đủ**.
- 403: Không có quyền tạo lịch hẹn cho case này.
- 404: Không tìm thấy bệnh án.

#### Hướng dẫn xử lý trên FE:

- Nếu BE trả về lỗi số dư không đủ, hiển thị thông báo cho user.
- Nếu thành công, lịch hẹn sẽ có trạng thái payment là `PAID` và paymentMethod là `WALLET`.
- Nếu chọn VNPAY, FE thực hiện redirect sang cổng thanh toán như cũ.

---

## 2. Lấy danh sách lịch hẹn

- **Endpoint:** `GET /appointments`
- **Yêu cầu xác thực:** Bearer Token
- **Query Params:**
  - `q`: Từ khoá tìm kiếm (id, ngày, trạng thái)
  - `page`: Trang (mặc định 1)
  - `limit`: Số lượng/trang (mặc định 10)
- **Response:**

```json
{
  "total": 2,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "_id": "string",
      "appointmentId": "string",
      "patient": { "_id": "string", "fullName": "string" },
      "doctor": { "_id": "string", "fullName": "string", "specialty": { "_id": "string", "name": "string" } },
      "specialty": { "_id": "string", "name": "string" },
      "date": "YYYY-MM-DD",
      "slot": "string",
      "timezone": "string",
      "status": "PENDING | CONFIRMED | REJECTED | CANCELLED",
      "medicalForm": { ... },
      "payment": { ... },
      "notes": "string"
    }
  ]
}
```

---

## 3. Xem chi tiết lịch hẹn

- **Endpoint:** `GET /appointments/:id`
- **Yêu cầu xác thực:** Bearer Token
- **Response:**

```json
{
  "_id": "string",
  "appointmentId": "string",
  "patient": { "_id": "string", "fullName": "string" },
  "doctor": { "_id": "string", "fullName": "string", "specialty": { "_id": "string", "name": "string" } },
  "specialty": { "_id": "string", "name": "string" },
  "date": "YYYY-MM-DD",
  "slot": "string",
  "timezone": "string",
  "status": "PENDING | CONFIRMED | REJECTED | CANCELLED",
  "medicalForm": { ... },
  "payment": { ... },
  "notes": "string",
  "booking": {
    "date": "YYYY-MM-DD",
    "slot": "string",
    "timezone": "string"
  }
}
```

- **Lỗi thường gặp:**
  - 404: Không tìm thấy lịch hẹn.

---

## 4. Cập nhật lịch hẹn

- **Endpoint:** `PATCH /appointments/:id`
- **Yêu cầu xác thực:** Bearer Token
- **Request Body:**

```json
{
  "doctor": "string (MongoId, optional)",
  "date": "YYYY-MM-DD (optional)",
  "slot": "string (optional)",
  "medicalForm": { ... },
  "payment": { ... },
  "notes": "string (optional)"
}
```

- **Response:**

```json
{
  "_id": "string",
  ... // các trường lịch hẹn sau cập nhật
}
```

- **Lỗi thường gặp:**
  - 404: Không tìm thấy lịch hẹn.

---

## 5. Xoá lịch hẹn

- **Endpoint:** `DELETE /appointments/:id`
- **Yêu cầu xác thực:** Bearer Token (admin)
- **Response:**

```json
{ "message": "Lịch hẹn đã được xóa" }
```

- **Lỗi thường gặp:**
  - 404: Không tìm thấy lịch hẹn.

---

## 6. Bác sĩ xác nhận lịch hẹn

- **Endpoint:** `PATCH /appointments/:id/confirm`
- **Yêu cầu xác thực:** Bearer Token, role `DOCTOR`
- **Request Body:**

```json
{ "note": "string (optional)" }
```

- **Response:**

```json
{ "message": "Lịch hẹn đã được xác nhận và email đã được gửi." }
```

- **Lỗi thường gặp:**
  - 400: Lịch hẹn không ở trạng thái chờ.
  - 403: Không phải bác sĩ được giao.
  - 404: Không tìm thấy lịch hẹn.

---

## 7. Bác sĩ từ chối lịch hẹn

- **Endpoint:** `PATCH /appointments/:id/reject`
- **Yêu cầu xác thực:** Bearer Token, role `DOCTOR`
- **Request Body:**

```json
{ "reason": "string" }
```

- **Response:**

```json
{ "message": "Lịch hẹn đã được từ chối và email đã được gửi." }
```

- **Lỗi thường gặp:**
  - 400: Lịch hẹn không ở trạng thái chờ.
  - 403: Không phải bác sĩ được giao.
  - 404: Không tìm thấy lịch hẹn.

---

## 8. Migrate status (dev tool)

- **Endpoint:** `GET /appointments/migrate-specialty`
- **Yêu cầu xác thực:** Bearer Token
- **Response:**

```json
{ "message": "Đã migrate status thành công." }
```

---

## 9. Lưu ý

- Tất cả endpoint đều yêu cầu xác thực JWT.
- Trạng thái hợp lệ: `PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`.
- Chỉ bác sĩ được giao mới có quyền xác nhận/từ chối lịch hẹn.
- Dữ liệu liên quan đến payment, medicalForm, notes là optional.

---

## 10. Liên hệ

- Backend: [Tên, email]
- Frontend: [Tên, email]
