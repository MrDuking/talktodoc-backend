# Tài liệu Lịch sử Ví (Wallet Balance/History) cho Patient/Doctor

## 1. Tổng quan

Hệ thống ví (wallet) cho cả bệnh nhân (Patient) và bác sĩ (Doctor) đều lưu lịch sử giao dịch (walletHistory/transactionHistory) và số dư hiện tại (walletBalance/balance).

- **Patient:**
  - `walletBalance`: Số dư ví hiện tại (number)
  - `walletHistory`: Danh sách giao dịch ví (array)
- **Doctor:**
  - `wallet.balance`: Số dư ví hiện tại (number)
  - `wallet.transactionHistory`: Danh sách giao dịch ví (array)

---

## 2. Mẫu dữ liệu lịch sử ví (Patient)

```json
{
  "walletBalance": 150000,
  "walletHistory": [
    {
      "amount": 50000,
      "type": "DEPOSIT", // Nạp tiền
      "description": "Nạp tiền vào ví qua VNPAY",
      "createdAt": "2024-06-03T10:00:00.000Z"
    },
    {
      "amount": 150000,
      "type": "WITHDRAW", // Thanh toán lịch hẹn
      "description": "Thanh toán lịch hẹn AP123456 bằng ví",
      "createdAt": "2024-06-03T11:00:00.000Z"
    },
    {
      "amount": 150000,
      "type": "REFUND", // Hoàn tiền
      "description": "Hoàn tiền từ lịch hẹn AP123456 bị hủy",
      "createdAt": "2024-06-03T12:00:00.000Z"
    }
  ]
}
```

### Giải thích field:

- `amount`: Số tiền giao dịch (number)
- `type`: Loại giao dịch (`DEPOSIT` - nạp tiền, `WITHDRAW` - trừ tiền, `REFUND` - hoàn tiền)
- `description`: Mô tả giao dịch (string, có thể hiện mã lịch hẹn, lý do, v.v)
- `createdAt`: Thời gian giao dịch (ISO string)

---

## 3. Các loại giao dịch

- `DEPOSIT`: Nạp tiền vào ví (qua VNPAY, admin, v.v)
- `WITHDRAW`: Thanh toán lịch hẹn, mua dịch vụ, v.v
- `REFUND`: Hoàn tiền khi lịch hẹn bị hủy hoặc lỗi

---

## 4. Gợi ý UI/UX cho FE

- Hiển thị số dư ví hiện tại (`walletBalance` hoặc `wallet.balance`)
- Hiển thị bảng/DS các giao dịch gần nhất:
  - Cột: Thời gian | Loại giao dịch | Số tiền (+/-) | Mô tả
  - Phân biệt màu sắc: `DEPOSIT`/`REFUND` (màu xanh, cộng tiền), `WITHDRAW` (màu đỏ, trừ tiền)
  - Có thể filter theo loại giao dịch
- Tooltip/chi tiết: Hiển thị đầy đủ `description` khi hover/click
- Sắp xếp mặc định: mới nhất lên đầu

---

## 5. API liên quan

- Khi tạo lịch hẹn bằng ví, BE sẽ tự động tạo giao dịch `WITHDRAW` trong `walletHistory` của patient
- Khi hoàn tiền, BE sẽ tạo giao dịch `REFUND`
- Khi nạp tiền, BE sẽ tạo giao dịch `DEPOSIT`

---

## 6. Lưu ý cho Frontend

- Luôn lấy số dư từ `walletBalance` (patient) hoặc `wallet.balance` (doctor)
- Lịch sử giao dịch lấy từ `walletHistory` (patient) hoặc `wallet.transactionHistory` (doctor)
- Có thể phân biệt giao dịch liên quan lịch hẹn qua `description` (có mã lịch hẹn)
- Nếu cần API lấy lịch sử ví riêng, có thể đề xuất thêm endpoint

---

## 7. Ví dụ UI

| Thời gian        | Loại giao dịch | Số tiền  | Mô tả                                 |
| ---------------- | -------------- | -------- | ------------------------------------- |
| 03/06/2024 12:00 | REFUND         | +150,000 | Hoàn tiền từ lịch hẹn AP123456 bị hủy |
| 03/06/2024 11:00 | WITHDRAW       | -150,000 | Thanh toán lịch hẹn AP123456 bằng ví  |
| 03/06/2024 10:00 | DEPOSIT        | +50,000  | Nạp tiền vào ví qua VNPAY             |

---

Nếu cần thêm API hoặc custom filter, liên hệ backend để bổ sung!

---

## 8. Thông tin ngân hàng (Bank Info)

### 1. Mẫu dữ liệu bank trong user

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

### 2. API cập nhật thông tin ngân hàng

- **Endpoint (cho từng loại user):**
  - PATCH `/api/v1/patients/:_id/bank`
  - PATCH `/api/v1/doctors/:_id/bank`
  - PATCH `/api/v1/employees/:_id/bank`
- **Request Body:**

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

- **Response:**

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

### 3. Giải thích field

- `accountNumber`: Số tài khoản ngân hàng
- `bankName`: Tên ngân hàng
- `branch`: Chi nhánh
- `accountHolder`: Họ và tên chủ tài khoản
- `phoneNumber`: Số điện thoại liên kết tài khoản

### 4. Lưu ý cho FE

- FE chỉ cần gọi endpoint PATCH tương ứng với user, truyền object bank như mẫu.
- Khi lấy thông tin user, trường `bank` sẽ trả về nếu đã lưu.
- Có thể dùng chung UI cho mọi loại user.

---
