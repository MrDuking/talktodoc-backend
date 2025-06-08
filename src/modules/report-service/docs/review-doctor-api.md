# API Thống Kê Đánh Giá Bác Sĩ

## Mục đích

API trả về danh sách thống kê đánh giá của các bác sĩ để hiển thị bảng thống kê ở FE.

## Endpoint

```
GET /api/report/review-doctor
```

## Query Params (optional)

- `name` (string): Tìm kiếm theo tên bác sĩ
- `doctorId` (string): Tìm kiếm theo mã bác sĩ
- `page` (number): Trang hiện tại (mặc định 1)
- `pageSize` (number): Số lượng mỗi trang (mặc định 20)

## Response format

```json
{
  "message": "Lấy danh sách thống kê đánh giá bác sĩ thành công",
  "status": 200,
  "data": {
    "items": [
      {
        "doctorId": "BS001",
        "name": "Nguyễn Văn A",
        "avatarUrl": "https://api.talktodoc.com/uploads/avatars/doctor_001.jpg",
        "avgRating": 4.8,
        "reviewCount": 2,
        "reviewDetails": [
          {
            "ratingScore": 5,
            "description": "Bác sĩ rất tận tâm",
            "appointmentId": "665e1b..."
          },
          {
            "ratingScore": 4,
            "description": "Tư vấn tốt",
            "appointmentId": "665e1c..."
          }
        ]
      },
      {
        "doctorId": "BS002",
        "name": "Trần Thị B",
        "avatarUrl": null,
        "avgRating": 4.5,
        "reviewCount": 1,
        "reviewDetails": [
          {
            "ratingScore": 4,
            "description": "Khá ổn",
            "appointmentId": "665e1d..."
          }
        ]
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 2
  }
}
```

## Giải thích các field

- `message`: Thông báo kết quả xử lý
- `status`: HTTP status code
- `data.items`: Mảng các bác sĩ thống kê
  - `doctorId`: Mã bác sĩ
  - `name`: Tên bác sĩ
  - `avatarUrl`: Link ảnh đại diện bác sĩ (string hoặc null)
  - `avgRating`: Điểm đánh giá trung bình (float, 1-5)
  - `reviewCount`: Tổng số lượt đánh giá
  - `reviewDetails`: Mảng chi tiết từng đánh giá của bác sĩ
    - `ratingScore`: Điểm đánh giá (number)
    - `description`: Nội dung đánh giá (string, có thể rỗng)
    - `appointmentId`: Id lịch hẹn liên quan (string, có thể undefined)
- `data.page`: Trang hiện tại
- `data.pageSize`: Số lượng mỗi trang
- `data.total`: Tổng số bác sĩ thỏa điều kiện

## Quy ước

- FE chỉ cần các field trên để render bảng thống kê và chi tiết đánh giá.
- Nếu có filter nâng cao, BE bổ sung query param và mô tả rõ.
- Đáp ứng chuẩn format `{ message, data, status }`.
