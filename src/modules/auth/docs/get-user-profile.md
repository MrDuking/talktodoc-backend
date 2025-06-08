# API: Lấy thông tin user profile từ token

## 1. Tổng quan

API này cho phép frontend lấy thông tin chi tiết của user hiện tại (profile) dựa vào JWT token đăng nhập. Hệ thống tự động nhận diện role (PATIENT, DOCTOR, EMPLOYEE, ADMIN) và trả về thông tin tương ứng.

- **Endpoint:** `GET /api/v1/auth/me`
- **Yêu cầu:** Bearer Token (JWT)
- **Phân quyền:** Tất cả user đã đăng nhập

---

## 2. Request

### HTTP Request

```
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Không cần body

---

## 3. Response

### Thành công (200)

```json
{
  "message": "Lấy thông tin profile thành công",
  "data": {
    "_id": "664b1e2f2f8b2c001e7e7e7d",
    "username": "user01",
    "fullName": "Nguyễn Văn A",
    "email": "a@gmail.com",
    "phoneNumber": "0987654321",
    "role": "PATIENT"
    // ... các field khác tuỳ role
  },
  "status": 200
}
```

#### Giải thích field

- `message`: Thông báo kết quả
- `data`: Thông tin user (tùy role sẽ có các field khác nhau)
- `status`: Mã trạng thái HTTP

#### Ví dụ cho role DOCTOR

```json
{
  "message": "Lấy thông tin profile thành công",
  "data": {
    "_id": "664b1e2f2f8b2c001e7e7e7e",
    "username": "doctor01",
    "fullName": "BS. Trần Thị B",
    "email": "doctor@gmail.com",
    "phoneNumber": "0912345678",
    "role": "DOCTOR",
    "specialty": { "_id": "...", "name": "Nội tổng quát" },
    "rank": { "_id": "...", "name": "Bác sĩ CKI" },
    "hospital": { "_id": "...", "name": "BV Bạch Mai" }
    // ...
  },
  "status": 200
}
```

---

## 4. Lỗi thường gặp

- **401 Unauthorized**: Token không hợp lệ hoặc thiếu Bearer Token

  ```json
  { "message": "Token không hợp lệ", "data": null, "status": 401 }
  ```

- **404 Not Found**: Không tìm thấy user (hiếm gặp, chỉ khi user bị xóa)

---

## 5. Hướng dẫn sử dụng (FE)

- Gọi API này sau khi user đăng nhập thành công để lấy thông tin hiển thị trên dashboard/profile.
- Luôn truyền header: `Authorization: Bearer <token>`
- Dùng field `role` để xác định giao diện phù hợp (bệnh nhân, bác sĩ, nhân viên, admin).
- Nếu nhận lỗi 401, redirect về trang đăng nhập.

---

## 6. Ghi chú

- Nếu cần bổ sung field nào cho từng role, hãy báo backend để update docs và API.
- Response luôn chuẩn hóa `{ message, data, status }`.
- Có thể test trực tiếp trên Swagger UI hoặc Postman.
