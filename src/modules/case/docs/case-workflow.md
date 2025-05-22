# Quy trình xử lý Case (Bệnh án)

## 1. Tổng quan về trạng thái (Status)

### Các trạng thái của Case:
- `DRAFT`: Bệnh án đang được soạn thảo
- `PENDING`: Đã gửi yêu cầu tư vấn, chờ bác sĩ xác nhận
- `ASSIGNED`: Bác sĩ đã xác nhận và đang xử lý
- `COMPLETED`: Hoàn thành tư vấn/điều trị
- `CANCELLED`: Đã hủy bệnh án

### Các hành động (Action):
- `CREATE`: Tạo mới bệnh án (-> DRAFT)
- `SAVE`: Lưu tạm bệnh án (DRAFT -> DRAFT)
- `SUBMIT`: Gửi yêu cầu/hoàn thành (DRAFT -> PENDING -> ASSIGNED -> COMPLETED)
- `SENDBACK`: Trả về chỉnh sửa (ASSIGNED -> DRAFT)

## 2. Luồng xử lý chi tiết

### 2.1. Tạo mới Case (CREATE)
- Input: specialty (bắt buộc)
- Output: Case mới với status = DRAFT
- Điều kiện: Không cần case_id

### 2.2. Lưu tạm (SAVE)
- Input: case_id, medical_form (tùy chọn)
- Output: Case được cập nhật
- Điều kiện: Case phải ở trạng thái DRAFT

### 2.3. Gửi yêu cầu/Hoàn thành (SUBMIT)
#### Từ DRAFT -> PENDING:
- Input: case_id, appointment_id (bắt buộc)
- Điều kiện: Case chưa có appointment
- Kết quả: Case chuyển sang PENDING

#### Từ PENDING -> ASSIGNED:
- Tự động khi appointment được bác sĩ xác nhận (CONFIRMED)
- Cập nhật medical_form nếu có

#### Từ ASSIGNED -> COMPLETED:
- Điều kiện: Appointment phải ở trạng thái COMPLETED
- Cập nhật medical_form cuối cùng

### 2.4. Trả về chỉnh sửa (SENDBACK)
- Input: case_id
- Điều kiện: Case phải ở trạng thái ASSIGNED
- Kết quả: Case chuyển về DRAFT

## 3. Đồng bộ với Appointment

### 3.1. Appointment -> Case
- Khi appointment CONFIRMED -> Case ASSIGNED
- Khi appointment COMPLETED -> Cho phép case SUBMIT để chuyển sang COMPLETED
- Khi appointment REJECTED/CANCELLED -> Case CANCELLED

### 3.2. Case -> Appointment
- Khi case SUBMIT lần đầu -> Tạo appointment mới (PENDING)
- Khi case COMPLETED -> Đánh dấu đã hoàn thành tư vấn

## 4. Xử lý lỗi

### 4.1. Validation
- Kiểm tra case_id hợp lệ
- Kiểm tra quyền truy cập của user
- Kiểm tra trạng thái hiện tại trước khi thực hiện action
- Xác thực appointment_id khi submit

### 4.2. Các lỗi thường gặp
- Case không tồn tại
- Không có quyền truy cập
- Trạng thái không phù hợp với action
- Thiếu thông tin bắt buộc
- Appointment chưa hoàn thành

## 5. Ví dụ Request/Response

### Tạo mới:
```json
POST /case/data
{
  "action": "create",
  "specialty": "specialtyId",
  "medical_form": {
    "symptoms": "Đau đầu",
    "questions": []
  }
}
```

### Submit lần đầu:
```json
POST /case/data
{
  "case_id": "caseId",
  "appointment_id": "appointmentId",
  "action": "submit"
}
```

### Hoàn thành case:
```json
POST /case/data
{
  "case_id": "caseId",
  "medical_form": {
    "diagnosis": "...",
    "treatment": "..."
  },
  "action": "submit"
}
``` 