# Quy trình hoàn thành (Complete) Appointment

## Tổng quan

Tài liệu này mô tả chi tiết quy trình và yêu cầu để hoàn thành (complete) một appointment (lịch hẹn) trong hệ thống TalkToDoc. Khi một cuộc hẹn được đánh dấu là hoàn thành, nó sẽ tự động cập nhật trạng thái của case liên kết, cho phép bệnh nhân và bác sĩ hoàn tất quy trình khám bệnh.

## Điều kiện tiên quyết

Để một appointment có thể được hoàn thành (chuyển sang trạng thái `COMPLETED`), cần đáp ứng các điều kiện sau:

1. Appointment phải đang ở trạng thái `CONFIRMED` (đã được bác sĩ xác nhận)
2. Cuộc gọi khám bệnh đã diễn ra (nên có thông tin `duration_call`)
3. Người thực hiện hành động phải là bác sĩ được gán hoặc admin

## Quy trình hoàn thành appointment

### 1. Gọi API cập nhật appointment

```http
PATCH /appointments/:id
```

### 2. Cung cấp dữ liệu cần thiết

```json
{
  "status": "COMPLETED",
  "duration_call": "00:15:30", // Thời gian cuộc gọi (tùy chọn)
  "notes": "Bệnh nhân đã được tư vấn về chế độ ăn uống và thuốc" // Ghi chú (tùy chọn)
}
```

### 3. Xử lý trong service

```typescript
if (updateDto.status === 'COMPLETED') {
  appointment.status = 'COMPLETED'
  appointment.completedAt = new Date()

  // Các xử lý khác như cập nhật duration_call nếu có
  if (updateDto.duration_call) {
    appointment.duration_call = updateDto.duration_call
  }

  // Xóa status khỏi updateDto để tránh cập nhật lại
  delete updateDto.status
}
```

### 4. Lưu thay đổi

```typescript
await appointment.save()
```

### 5. Kết quả trả về

```json
{
  "message": "Lịch hẹn đã được cập nhật",
  "data": {
    "_id": "664b1e2f2f8b2c001e7e7e80",
    "appointmentId": "AP123456",
    "patient": "664b1e2f2f8b2c001e7e7e7d",
    "doctor": "664b1e2f2f8b2c001e7e7e81",
    "specialty": "664b1e2f2f8b2c001e7e7e7f",
    "date": "2024-05-20",
    "slot": "08:00-09:00",
    "timezone": "Asia/Ho_Chi_Minh",
    "status": "COMPLETED",
    "completedAt": "2024-05-20T09:15:30.000Z",
    "duration_call": "00:15:30",
    "notes": "Bệnh nhân đã được tư vấn về chế độ ăn uống và thuốc",
    "payment": {
      "platformFee": 50000,
      "doctorFee": 250000,
      "discount": 0,
      "total": 300000,
      "status": "PAID",
      "paymentMethod": "VNPAY"
    }
  }
}
```

## Tác động đến Case

Khi một appointment được đánh dấu là `COMPLETED`, nó sẽ cho phép case liên kết được chuyển sang trạng thái `completed`. Tuy nhiên, **hệ thống không tự động cập nhật trạng thái của case**, mà chỉ cho phép case được chuyển sang trạng thái hoàn thành khi được gọi API riêng.

Quy trình hoàn thành case sau khi appointment đã hoàn thành:

1. Kiểm tra điều kiện trong CaseService:

```typescript
// Kiểm tra trạng thái appointment
if (caseRecord?.appointmentId) {
  const appointment = await this.appointmentService.findOne(caseRecord.appointmentId.toString())
  if (appointment.status !== 'COMPLETED') {
    throw new BadRequestException('Lịch hẹn chưa được hoàn tất')
  }
}
```

2. Nếu appointment đã `COMPLETED`, case có thể được chuyển sang trạng thái `completed`.

## Ví dụ Request

### Request Body

```json
{
  "status": "COMPLETED",
  "duration_call": "00:15:30",
  "notes": "Bệnh nhân đã được tư vấn về chế độ ăn uống và thuốc"
}
```

### Response

```json
{
  "message": "Lịch hẹn đã được cập nhật",
  "data": {
    "_id": "664b1e2f2f8b2c001e7e7e80",
    "appointmentId": "AP123456",
    "patient": {
      "_id": "664b1e2f2f8b2c001e7e7e7d",
      "fullName": "Nguyễn Văn A"
    },
    "doctor": {
      "_id": "664b1e2f2f8b2c001e7e7e81",
      "fullName": "BS. Trần Thị B"
    },
    "specialty": {
      "_id": "664b1e2f2f8b2c001e7e7e7f",
      "name": "Nội tổng quát"
    },
    "date": "2024-05-20",
    "slot": "08:00-09:00",
    "timezone": "Asia/Ho_Chi_Minh",
    "status": "COMPLETED",
    "completedAt": "2024-05-20T09:15:30.000Z",
    "duration_call": "00:15:30",
    "notes": "Bệnh nhân đã được tư vấn về chế độ ăn uống và thuốc",
    "payment": {
      "platformFee": 50000,
      "doctorFee": 250000,
      "discount": 0,
      "total": 300000,
      "status": "PAID",
      "paymentMethod": "VNPAY"
    }
  }
}
```

## Lỗi thường gặp

1. **Appointment không ở trạng thái `CONFIRMED`**

   - Thông báo: "Lịch hẹn phải ở trạng thái đã xác nhận trước khi hoàn thành"
   - Giải pháp: Đảm bảo appointment đang ở trạng thái `CONFIRMED`

2. **Không có quyền cập nhật**

   - Thông báo: "Bạn không có quyền cập nhật lịch hẹn này"
   - Giải pháp: Đảm bảo người dùng là bác sĩ được gán hoặc admin

3. **Appointment không tồn tại**
   - Thông báo: "Không tìm thấy lịch hẹn"
   - Giải pháp: Kiểm tra ID appointment

## Các trường hợp đặc biệt

1. **Thanh toán chưa hoàn tất**

   - Hệ thống vẫn cho phép đánh dấu appointment là hoàn thành ngay cả khi thanh toán chưa hoàn tất
   - Tuy nhiên, nên đảm bảo thanh toán đã được xử lý trước khi hoàn thành appointment

2. **Cuộc gọi không diễn ra**
   - Trong trường hợp cuộc gọi không diễn ra nhưng bác sĩ vẫn muốn đánh dấu là hoàn thành, có thể bỏ qua trường `duration_call`
   - Nên ghi rõ lý do trong trường `notes`

## Tích hợp với các module khác

1. **Case Service**

   - Khi appointment hoàn thành, case liên kết có thể được chuyển sang trạng thái `completed`
   - Cần gọi API riêng để cập nhật case

2. **Payment Service**

   - Nếu thanh toán chưa hoàn tất, có thể cần xử lý thanh toán trước hoặc sau khi hoàn thành appointment

3. **Notification Service**
   - Gửi thông báo cho bệnh nhân khi appointment được hoàn thành
   - Nhắc nhở bệnh nhân hoàn thành case nếu cần

## Quy trình đầy đủ

1. Bác sĩ hoàn thành cuộc gọi khám bệnh
2. Hệ thống ghi nhận thời gian cuộc gọi
3. Bác sĩ hoặc admin cập nhật trạng thái appointment thành `COMPLETED`
4. Hệ thống lưu thời điểm hoàn thành và các thông tin liên quan
5. Bệnh nhân hoặc bác sĩ có thể cập nhật case sang trạng thái `completed`
6. Hệ thống gửi thông báo xác nhận hoàn thành đến các bên liên quan

## Lưu ý

- Sau khi appointment được hoàn thành, không nên cho phép thay đổi trạng thái nữa
- Nên lưu lại thời điểm hoàn thành (`completedAt`) để theo dõi và báo cáo
- Dữ liệu appointment đã hoàn thành có thể được sử dụng cho mục đích thống kê và báo cáo
- Nên gửi email thông báo cho bệnh nhân khi appointment được hoàn thành
