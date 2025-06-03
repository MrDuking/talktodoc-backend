# Tài liệu API Cập nhật Thông tin Ngân hàng (Bank Info) cho User

## 1. Tổng quan

Tất cả user (bệnh nhân, bác sĩ, nhân viên) đều có thể lưu thông tin ngân hàng trong trường `bank`.

- Trường `bank` gồm các thông tin:
  - `accountNumber`: Số tài khoản ngân hàng
  - `bankName`: Tên ngân hàng
  - `branch`: Chi nhánh
  - `accountHolder`: Họ và tên chủ tài khoản
  - `phoneNumber`: Số điện thoại liên kết tài khoản

---

## 2. API cập nhật thông tin ngân hàng

### Endpoint

- POST `/api/v1/patients/:_id/bank`
- POST `/api/v1/doctors/:_id/bank`
- POST `/api/v1/employees/:_id/bank`

### Request Body

```json
{
  "bank": {
    "accountNumber": "0123456789",
    "bankName": "Vietcombank",
    "branch": "Chi nhánh Hà Nội",
    "accountHolder": "Nguyễn Văn A",
    "phoneNumber": "0987654321"
  }
}
```

### Response

```json
{
  "_id": "...",
  ...,
  "bank": {
    "accountNumber": "0123456789",
    "bankName": "Vietcombank",
    "branch": "Chi nhánh Hà Nội",
    "accountHolder": "Nguyễn Văn A",
    "phoneNumber": "0987654321"
  }
}
```

---

## 3. Giải thích field

- `accountNumber`: Số tài khoản ngân hàng
- `bankName`: Tên ngân hàng
- `branch`: Chi nhánh
- `accountHolder`: Họ và tên chủ tài khoản
- `phoneNumber`: Số điện thoại liên kết tài khoản

---

## 4. Lưu ý cho Frontend

- FE chỉ cần gọi endpoint POST tương ứng với user, truyền object bank như mẫu.
- Khi lấy thông tin user, trường `bank` sẽ trả về nếu đã lưu.
- Có thể dùng chung UI cho mọi loại user.
- Nếu cần validate hoặc format số tài khoản, số điện thoại, FE nên kiểm tra trước khi gửi lên backend.

---
