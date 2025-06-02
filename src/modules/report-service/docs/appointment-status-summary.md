# API Thống Kê Trạng Thái Lịch Hẹn

## Endpoint

```
POST /report/appointment-status-summary
```

## Mô tả

API để lấy thống kê số lượng lịch hẹn theo từng trạng thái trong khoảng thời gian tuỳ chọn.

## Request Body

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Field giải thích

- `startDate`: Ngày bắt đầu (format: YYYY-MM-DD)
- `endDate`: Ngày kết thúc (format: YYYY-MM-DD)

## Response Format

```json
{
  "message": "Success",
  "data": [
    { "status": "CONFIRMED", "statusVn": "Đã Xác Nhận", "count": 1250 },
    { "status": "PENDING", "statusVn": "Đang Chờ", "count": 420 },
    { "status": "CANCELLED", "statusVn": "Đã Hủy", "count": 180 },
    { "status": "COMPLETED", "statusVn": "Đã Hoàn Thành", "count": 2100 }
  ],
  "status": 200
}
```

### Field giải thích

- `status`: Trạng thái lịch hẹn (enum: CONFIRMED, PENDING, CANCELLED, COMPLETED)
- `statusVn`: Tên trạng thái tiếng Việt
- `count`: Số lượng lịch hẹn trong trạng thái này

## Lưu ý

- Luôn trả về đủ 4 trạng thái, count = 0 nếu không có dữ liệu
- Thống kê theo field `createdAt` của lịch hẹn
- Format ngày: YYYY-MM-DD
- Response chuẩn `{ message, data, status }`
- Nếu sai định dạng hoặc thiếu field sẽ trả về lỗi 400

## Ví dụ lỗi

```json
{
  "message": "Validation failed",
  "data": null,
  "status": 400
}
```
