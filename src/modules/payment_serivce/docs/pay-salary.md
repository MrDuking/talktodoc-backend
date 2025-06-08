# Hướng dẫn FE sử dụng API thanh toán lương cho bác sĩ (pay-salary)

## 1. Mục đích

- FE sử dụng API này để xác nhận và cập nhật trạng thái đã thanh toán lương cho các order (hóa đơn) của bác sĩ trong một khoảng thời gian nhất định.
- Sau khi thanh toán, BE sẽ tự động cập nhật trạng thái lương cho order, trừ tiền ví bác sĩ và ghi lịch sử giao dịch vào ví.

---

## 2. Gửi request

### Endpoint

```
POST /api/payment/pay-salary
```

### Payload mẫu

```json
{
  "doctorIds": ["doctorId1", "doctorId2"],
  "orderIds": ["orderId1", "orderId2", "orderId3"],
  "startDate": "2024-06-01",
  "endDate": "2024-06-30"
}
```

### FE cần chuẩn bị:

- Lấy đúng danh sách `_id` của bác sĩ cần thanh toán lương (`doctorIds`).
- Lấy đúng danh sách `_id` của các order đã hoàn thành, cần thanh toán lương (`orderIds`).
- Chọn khoảng thời gian lọc order (`startDate`, `endDate` - định dạng YYYY-MM-DD).
- Gửi payload đúng format như trên.

---

## 3. Xử lý response

### Response thành công mẫu

```json
{
  "message": "Thanh toán lương thành công",
  "status": 200,
  "data": {
    "updated": 3,
    "orders": [
      { "_id": "orderId1", "salaryStatus": true },
      { "_id": "orderId2", "salaryStatus": true }
    ]
  }
}
```

### FE cần làm gì?

- Kiểm tra `status` và `message` để xác nhận thành công/thất bại.
- Nếu thành công, cập nhật UI: đánh dấu các order đã thanh toán lương (`salaryStatus: true`).
- Nếu thất bại, hiển thị thông báo lỗi rõ ràng cho user (dùng `message` từ response).

---

## 4. Hiển thị thông tin

- Có thể hiển thị số lượng order đã cập nhật (`data.updated`).
- Có thể hiển thị danh sách order đã thanh toán lương (`data.orders`).
- Nếu cần, FE có thể reload lại danh sách order để lấy trạng thái mới nhất.

---

## 5. Lưu ý UI/UX

- Nên xác nhận lại với user trước khi thực hiện thanh toán lương hàng loạt.
- Hiển thị loading/spinner khi đang gửi request.
- Hiển thị thông báo thành công/thất bại rõ ràng.
- Nếu BE trả về lỗi (ví dụ: không tìm thấy order hợp lệ), cần hiển thị đúng message cho user.

---

## 6. Lưu ý kỹ thuật

- BE sẽ tự động trừ tiền ví bác sĩ và ghi lịch sử vào `wallet.transactionHistory` của bác sĩ. FE không cần xử lý gì thêm về ví.
- Nếu cần hiển thị lịch sử giao dịch ví, chỉ cần lấy trường `wallet.transactionHistory` từ API user profile của bác sĩ.

---

## 7. Tóm tắt quy trình FE

1. FE lọc danh sách order và bác sĩ cần thanh toán lương.
2. FE gửi request đúng format lên API `/api/payment/pay-salary`.
3. FE nhận response, kiểm tra kết quả, cập nhật UI và thông báo cho user.
4. Nếu cần, FE reload lại danh sách order hoặc ví bác sĩ để hiển thị trạng thái mới nhất.

---

**Nếu có thắc mắc về nghiệp vụ hoặc cần bổ sung API, liên hệ backend để được hỗ trợ!**
