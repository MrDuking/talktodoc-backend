# Quy trình hoàn thành (Complete) Case

## Tổng quan

Tài liệu này mô tả chi tiết quy trình và yêu cầu để hoàn thành (complete) một case (bệnh án) trong hệ thống TalkToDoc. Quy trình này là bước cuối cùng trong vòng đời của một case, sau khi bệnh nhân đã tạo case, bác sĩ đã xác nhận và cuộc hẹn đã diễn ra.

## Điều kiện tiên quyết

Để một case có thể được hoàn thành (chuyển sang trạng thái `completed`), cần đáp ứng các điều kiện sau:

1. Case phải đang ở trạng thái `assigned` (đã được gán cho bác sĩ)
2. Appointment liên kết với case phải ở trạng thái `COMPLETED` (đã hoàn thành)
3. Người thực hiện hành động phải là bệnh nhân sở hữu case hoặc bác sĩ được gán

## Quy trình hoàn thành case

### 1. Kiểm tra điều kiện

```typescript
// Kiểm tra trạng thái case
if (caseRecord.status !== 'assigned') {
  throw new BadRequestException('Không thể submit ở trạng thái hiện tại')
}

// Kiểm tra trạng thái appointment
if (caseRecord?.appointmentId) {
  const appointment = await this.appointmentService.findOne(caseRecord.appointmentId.toString())
  if (appointment.status !== 'COMPLETED') {
    throw new BadRequestException('Lịch hẹn chưa được hoàn tất')
  }
}
```

### 2. Cập nhật thông tin y tế (nếu có)

Khi hoàn thành case, có thể cập nhật thông tin y tế cuối cùng vào `medicalForm`. Thông tin này thường bao gồm:

- Chẩn đoán cuối cùng
- Phương pháp điều trị
- Kết quả khám
- Ghi chú của bác sĩ

```typescript
if (medical_form) caseRecord.medicalForm = medical_form
```

### 3. Chuyển trạng thái

```typescript
caseRecord.status = 'completed'
```

### 4. Lưu thay đổi

```typescript
await caseRecord.save()
```

### 5. Trả về kết quả

```typescript
return {
  message: 'Cập nhật bệnh án thành công',
  data: {
    case_id: caseRecord._id,
    ...caseRecord.toObject(),
  },
}
```

## Ví dụ Request

### Request Body

```json
{
  "case_id": "664b1e2f2f8b2c001e7e7e7e",
  "medical_form": {
    "diagnosis": "Đau đầu căng thẳng",
    "treatment": "Nghỉ ngơi, uống thuốc giảm đau theo chỉ định",
    "followup": "Tái khám sau 2 tuần nếu triệu chứng không giảm",
    "note": "Bệnh nhân cần hạn chế làm việc quá sức, tăng cường nghỉ ngơi"
  },
  "action": "submit"
}
```

### Response

```json
{
  "message": "Cập nhật bệnh án thành công",
  "data": {
    "case_id": "664b1e2f2f8b2c001e7e7e7e",
    "_id": "664b1e2f2f8b2c001e7e7e7e",
    "patient": "664b1e2f2f8b2c001e7e7e7d",
    "specialty": "664b1e2f2f8b2c001e7e7e7f",
    "medicalForm": {
      "symptoms": "Đau đầu 3 ngày",
      "questions": [{ "question": "Có tiền sử cao huyết áp?", "answer": "Không" }],
      "diagnosis": "Đau đầu căng thẳng",
      "treatment": "Nghỉ ngơi, uống thuốc giảm đau theo chỉ định",
      "followup": "Tái khám sau 2 tuần nếu triệu chứng không giảm",
      "note": "Bệnh nhân cần hạn chế làm việc quá sức, tăng cường nghỉ ngơi"
    },
    "appointmentId": "664b1e2f2f8b2c001e7e7e80",
    "status": "completed",
    "offers": [...],
    "isDeleted": false,
    "createdAt": "2024-05-20T09:00:00.000Z",
    "updatedAt": "2024-05-21T15:30:00.000Z"
  }
}
```

## Lỗi thường gặp

1. **Case không ở trạng thái `assigned`**

   - Thông báo: "Không thể submit ở trạng thái hiện tại"
   - Giải pháp: Đảm bảo case đang ở trạng thái `assigned`

2. **Lịch hẹn chưa hoàn thành**

   - Thông báo: "Lịch hẹn chưa được hoàn tất"
   - Giải pháp: Đảm bảo lịch hẹn đã được đánh dấu là `COMPLETED`

3. **Không có quyền cập nhật**
   - Thông báo: "Bạn không có quyền cập nhật case này"
   - Giải pháp: Đảm bảo người dùng là chủ sở hữu case hoặc bác sĩ được gán

## Các trường hợp đặc biệt

1. **Case không có appointment**

   - Trong trường hợp này, cần kiểm tra kỹ và có thể yêu cầu liên kết với appointment trước khi hoàn thành

2. **Appointment bị hủy**

   - Nếu appointment bị hủy, case không nên được hoàn thành mà nên được chuyển sang trạng thái `cancelled`

3. **Thông tin y tế không đầy đủ**
   - Không có yêu cầu bắt buộc về nội dung của `medicalForm`, nhưng nên có ít nhất thông tin chẩn đoán và hướng điều trị

## Tích hợp với các module khác

1. **Appointment Service**

   - Khi case được hoàn thành, có thể cần cập nhật thông tin liên quan trong appointment

2. **Notification Service**

   - Gửi thông báo cho bệnh nhân khi case được hoàn thành

3. **Payment Service**
   - Nếu có thanh toán liên quan, cần đảm bảo thanh toán đã được xử lý trước khi hoàn thành case

## Lưu ý

- Sau khi case được hoàn thành, không nên cho phép chỉnh sửa thông tin y tế nữa
- Có thể cần lưu lịch sử các thay đổi của case để đảm bảo tính minh bạch
- Dữ liệu case đã hoàn thành có thể được sử dụng cho mục đích thống kê và báo cáo
