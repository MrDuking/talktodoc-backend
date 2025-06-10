# API Báo cáo chuyên khoa

## Endpoint

`GET /api/report/specialty-statistics`

### Mục đích

Trả về danh sách thống kê các chuyên khoa, bao gồm: số lượt khám, doanh thu, số bác sĩ, đánh giá trung bình, phần trăm tăng/giảm so với kỳ trước.

---

## Query Params

| Tên       | Kiểu   | Bắt buộc | Mô tả                                                      |
| --------- | ------ | -------- | ---------------------------------------------------------- |
| timeRange | string | Có       | Khoảng thời gian: `week`, `month`, `quarter`, `custom`     |
| startDate | string | Không    | Ngày bắt đầu (YYYY-MM-DD, dùng khi timeRange=custom)       |
| endDate   | string | Không    | Ngày kết thúc (YYYY-MM-DD, dùng khi timeRange=custom)      |
| specialty | string | Không    | Mã chuyên khoa (lọc theo chuyên khoa, 'all' để lấy tất cả) |
| hospital  | string | Không    | Mã cơ sở y tế (nếu có, 'all' để lấy tất cả)                |
| page      | number | Không    | Trang hiện tại (mặc định 1)                                |
| pageSize  | number | Không    | Số dòng/trang (mặc định 20)                                |

---

## Response format

```json
{
  "message": "Lấy báo cáo chuyên khoa thành công",
  "status": 200,
  "data": {
    "items": [
      {
        "specialty": "Tim mạch",
        "specialtyCode": "tim-mach",
        "specialtyIcon": "/assets/icons/specialty/heart.png",
        "visits": 120,
        "revenue": 36000000,
        "doctorCount": 5,
        "avgRating": 4.7,
        "percentChange": 12.5
      },
      {
        "specialty": "Nội tiết",
        "specialtyCode": "noi-tiet",
        "specialtyIcon": "/assets/icons/specialty/diabetes.png",
        "visits": 80,
        "revenue": 24000000,
        "doctorCount": 4,
        "avgRating": 4.5,
        "percentChange": -5.2
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 2
  }
}
```

### Giải thích từng field

- `message`: Thông báo kết quả.
- `status`: Mã trạng thái HTTP.
- `data.items`: Danh sách chuyên khoa thống kê.
  - `specialty`: Tên chuyên khoa.
  - `specialtyCode`: Mã chuyên khoa (dùng cho filter).
  - `specialtyIcon`: Đường dẫn icon chuyên khoa.
  - `visits`: Số lượt khám trong kỳ.
  - `revenue`: Tổng doanh thu (VNĐ).
  - `doctorCount`: Số bác sĩ thuộc chuyên khoa.
  - `avgRating`: Điểm đánh giá trung bình (0-5).
  - `percentChange`: % tăng/giảm so với kỳ trước (dấu + hoặc -).
- `data.page`: Trang hiện tại.
- `data.pageSize`: Số dòng/trang.
- `data.total`: Tổng số chuyên khoa thỏa điều kiện.

---

## Quy ước

- Nếu filter sai định dạng, trả về lỗi 400, message rõ ràng.
- Nếu không có dữ liệu, trả về `items: []`, `total: 0`.
- Nếu có trường nào FE không dùng hoặc chỉ BE dùng, phải note rõ trong docs.

---

## Quy trình update docs

- Nếu thay đổi response, phải update lại file này trước khi merge code.

> [BE NOTE 2024-06-09]:
>
> - Field `specialtyIcon` trong response sẽ lấy từ trường `avatarUrl` của specialty trong database.
> - Nếu FE cần mapping icon riêng cho từng chuyên khoa, vui lòng xác nhận lại hoặc bổ sung mapping tương ứng.
