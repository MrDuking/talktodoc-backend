# Tài liệu API Lịch hẹn (Appointments)

## Tổng quan

Module này cung cấp các API để quản lý lịch hẹn giữa bệnh nhân và bác sĩ, bao gồm tạo, lấy danh sách, chi tiết, cập nhật, xác nhận, từ chối, hoàn thành và xoá lịch hẹn. Hỗ trợ thanh toán qua ví điện tử hoặc VNPAY, đồng bộ trạng thái với Case, gửi email thông báo tự động.

---

## 1. Định nghĩa dữ liệu (Appointment Object)

### Mẫu dữ liệu trả về (chuẩn hóa)

```json
{
  "_id": "664b1e2f2f8b2c001e7e7e80",
  "appointmentId": "AP123456",
  "patient": {
    "_id": "664b1e2f2f8b2c001e7e7e7d",
    "fullName": "Nguyễn Văn A",
    "email": "a@gmail.com"
  },
  "doctor": {
    "_id": "664b1e2f2f8b2c001e7e7e81",
    "fullName": "BS. Trần Thị B",
    "email": "b@gmail.com",
    "specialty": {
      "_id": "664b1e2f2f8b2c001e7e7e7f",
      "name": "Nội tổng quát"
    }
  },
  "specialty": {
    "_id": "664b1e2f2f8b2c001e7e7e7f",
    "name": "Nội tổng quát"
  },
  "date": "2024-05-20",
  "slot": "08:00-09:00",
  "timezone": "Asia/Ho_Chi_Minh",
  "status": "PENDING",
  "medicalForm": {
    /* ... */
  },
  "payment": {
    "platformFee": 50000,
    "doctorFee": 250000,
    "discount": 0,
    "total": 300000,
    "status": "PAID",
    "paymentMethod": "WALLET"
  },
  "notes": "Bệnh nhân đã được tư vấn về chế độ ăn uống và thuốc",
  "reason": "Bệnh nhân bận đột xuất",
  "confirmedAt": "2024-05-20T07:00:00.000Z",
  "cancelledAt": "2024-05-20T08:00:00.000Z",
  "completedAt": "2024-05-20T09:15:30.000Z",
  "duration_call": "00:15:30",
  "createdAt": "2024-05-19T10:00:00.000Z",
  "updatedAt": "2024-05-20T09:15:30.000Z",
  "booking": {
    "date": "2024-05-20",
    "slot": "08:00-09:00",
    "timezone": "Asia/Ho_Chi_Minh"
  }
}
```

### Giải thích các trường

- `_id`: ObjectId của lịch hẹn (MongoDB)
- `appointmentId`: Mã lịch hẹn định danh (dạng APxxxxxx)
- `patient`: Thông tin bệnh nhân (id, tên, email)
- `doctor`: Thông tin bác sĩ (id, tên, email, chuyên khoa)
- `specialty`: Chuyên khoa khám
- `date`: Ngày khám (YYYY-MM-DD)
- `slot`: Khung giờ khám (ví dụ: 08:00-09:00)
- `timezone`: Múi giờ (mặc định Asia/Ho_Chi_Minh)
- `status`: Trạng thái lịch hẹn (`PENDING`, `CONFIRMED`, `CANCELLED`, `REJECTED`, `COMPLETED`)
- `medicalForm`: Thông tin triệu chứng, khai báo y tế (object, optional)
- `payment`: Thông tin thanh toán (chi tiết bên dưới)
- `notes`: Ghi chú của bác sĩ hoặc bệnh nhân (optional)
- `reason`: Lý do hủy lịch hẹn (nếu có)
- `confirmedAt`, `cancelledAt`, `completedAt`: Thời điểm xác nhận, hủy, hoàn thành
- `duration_call`: Thời lượng cuộc gọi (nếu có)
- `createdAt`, `updatedAt`: Thời điểm tạo/cập nhật
- `booking`: Thông tin đặt lịch (date, slot, timezone)

#### Trường payment

- `platformFee`: Phí nền tảng
- `doctorFee`: Phí bác sĩ
- `discount`: Giảm giá
- `total`: Tổng tiền thanh toán
- `status`: Trạng thái thanh toán (`PAID`, `UNPAID`)
- `paymentMethod`: Phương thức thanh toán (`WALLET`, `VNPAY`)

---

## 2. API chi tiết

### 2.1. Tạo mới lịch hẹn

- **Endpoint:** `POST /appointments`
- **Yêu cầu:** Bearer Token (role: PATIENT)
- **Request Body:**

```json
{
  "case_id": "string (MongoId)",
  "specialty": "string (MongoId)",
  "doctor": "string (MongoId)",
  "date": "YYYY-MM-DD",
  "slot": "string (ví dụ: 09:00-09:30)",
  "timezone": "Asia/Ho_Chi_Minh",
  "paymentMethod": "WALLET | VNPAY",
  "payment": {
    "total": 300000,
    "platformFee": 50000,
    "doctorFee": 250000,
    "discount": 0
  }
}
```

#### Lưu ý:

- Nếu chọn `paymentMethod: 'WALLET'`, **bắt buộc** truyền đủ trường `payment.total`.
- Nếu chọn `VNPAY`, BE sẽ trả về trạng thái `UNPAID`, FE redirect sang cổng thanh toán.

- **Response mẫu:**

```json
{
  "message": "Tạo lịch hẹn thành công",
  "data": { ...Appointment Object... },
  "status": 201
}
```

#### Giải thích:

- Nếu thanh toán ví thành công, `payment.status = 'PAID'`, `paymentMethod = 'WALLET'`.
- Nếu không đủ tiền ví, trả về lỗi 400: "Số dư ví không đủ để thanh toán".

---

### 2.2. Lấy danh sách lịch hẹn

- **Endpoint:** `GET /appointments`
- **Yêu cầu:** Bearer Token
- **Query Params:**

  - `q`: Từ khoá tìm kiếm (id, ngày, trạng thái)
  - `page`: Trang (mặc định 1)
  - `limit`: Số lượng/trang (mặc định 10)

- **Response mẫu:**

```json
{
  "message": "Lấy danh sách lịch hẹn thành công",
  "data": {
    "items": [ ...Appointment Object... ],
    "page": 1,
    "limit": 10,
    "total": 2
  },
  "status": 200
}
```

#### Giải thích:

- `items`: Danh sách lịch hẹn
- `page`, `limit`, `total`: Phân trang

---

### 2.3. Xem chi tiết lịch hẹn

- **Endpoint:** `GET /appointments/:id`
- **Yêu cầu:** Bearer Token

- **Response mẫu:**

```json
{
  "message": "Lấy chi tiết lịch hẹn thành công",
  "data": { ...Appointment Object... },
  "status": 200
}
```

---

### 2.4. Cập nhật lịch hẹn

- **Endpoint:** `PATCH /appointments/:id`
- **Yêu cầu:** Bearer Token
- **Request Body:**

```json
{
  "doctor": "string (MongoId, optional)",
  "date": "YYYY-MM-DD (optional)",
  "slot": "string (optional)",
  "medicalForm": { ... },
  "payment": { ... },
  "notes": "string (optional)",
  "status": "COMPLETED | CANCELLED | ...",
  "duration_call": "00:15:30"
}
```

- **Response mẫu:**

```json
{
  "message": "Lịch hẹn đã được cập nhật",
  "data": { ...Appointment Object... },
  "status": 200
}
```

#### Lưu ý:

- Nếu cập nhật `status: COMPLETED`, hệ thống sẽ tự động set `completedAt`, cộng tiền cho bác sĩ nếu đã thanh toán, cập nhật trạng thái case liên kết.
- Nếu cập nhật `status: CANCELLED`, sẽ hoàn tiền cho bệnh nhân nếu đã thanh toán, gửi email thông báo, trừ điểm bác sĩ nếu có.

---

### 2.5. Xóa lịch hẹn

- **Endpoint:** `DELETE /appointments/:id`
- **Yêu cầu:** Bearer Token (role: ADMIN)

- **Response mẫu:**

```json
{
  "message": "Lịch hẹn đã được xóa",
  "status": 200
}
```

---

### 2.6. Bác sĩ xác nhận lịch hẹn

- **Endpoint:** `PATCH /appointments/:id/confirm`
- **Yêu cầu:** Bearer Token (role: DOCTOR)
- **Request Body:**

```json
{ "note": "string (optional)" }
```

- **Response mẫu:**

```json
{
  "message": "Lịch hẹn đã được xác nhận và email đã được gửi.",
  "status": 200
}
```

---

### 2.7. Bác sĩ từ chối lịch hẹn

- **Endpoint:** `PATCH /appointments/:id/reject`
- **Yêu cầu:** Bearer Token (role: DOCTOR)
- **Request Body:**

```json
{ "reason": "string" }
```

- **Response mẫu:**

```json
{
  "message": "Lịch hẹn đã được từ chối và email đã được gửi.",
  "status": 200
}
```

---

### 2.8. Lấy lịch hẹn của bác sĩ (lọc nâng cao)

- **Endpoint:** `GET /appointments/doctor/:doctorId`
- **Query Params:**

  - `status`: Lọc theo trạng thái
  - `date`: Lọc theo ngày (YYYY-MM-DD)
  - `from_date`, `to_date`: Lọc theo khoảng ngày
  - `page`, `limit`: Phân trang

- **Response mẫu:**

```json
{
  "message": "Lấy danh sách lịch hẹn của bác sĩ thành công",
  "data": {
    "items": [ ...Appointment Object... ],
    "page": 1,
    "limit": 10,
    "total": 2
  },
  "status": 200
}
```

---

## 3. Quy tắc nghiệp vụ & lưu ý cho FE

- **Trạng thái hợp lệ:** `PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`, `COMPLETED`
- **Chỉ bác sĩ được giao mới có quyền xác nhận/từ chối lịch hẹn.**
- **Bệnh nhân chỉ được tạo lịch hẹn cho case của mình.**
- **Khi appointment hoàn thành, case liên kết có thể chuyển sang trạng thái completed (gọi API riêng).**
- **Nếu appointment bị hủy hoặc từ chối, hệ thống sẽ hoàn tiền tự động nếu đã thanh toán.**
- **Mọi response đều chuẩn hóa `{ message, data, status }`.**
- **Nếu trả về list, luôn có `items`, `page`, `limit`, `total`.**
- **Nếu có field nào FE không dùng hoặc chỉ BE dùng, sẽ note rõ trong docs.**

---

## 4. Lỗi thường gặp & hướng dẫn xử lý

- **400:** Thiếu trường bắt buộc, dữ liệu không hợp lệ, số dư ví không đủ
- **403:** Không có quyền thao tác
- **404:** Không tìm thấy lịch hẹn/case
- **409:** Trùng lịch hẹn (bác sĩ đã có lịch vào khung giờ đó)

---

## 5. Quy trình cập nhật docs

- **Mọi thay đổi response phải update lại docs trước khi merge.**
- **Nếu field nào sẽ bị FE ignore hoặc chỉ cho BE xài thì cũng phải note rõ.**
- **Mỗi endpoint đều có ví dụ JSON + giải thích field.**

---

## 6. Liên hệ

- **Backend:** [Tên, email]
- **Frontend:** [Tên, email]

---

**FE cần góp ý, phản hồi về flow hoặc đề xuất thay đổi logic, vui lòng comment trực tiếp vào docs này hoặc liên hệ backend.**
