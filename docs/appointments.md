# API: Lấy danh sách lịch hẹn (GET /appointments)

## Mô tả

Lấy danh sách lịch hẹn. Hỗ trợ tìm kiếm và phân trang. Nếu không truyền bất kỳ tham số nào (`q`, `page`, `limit`) thì trả về toàn bộ danh sách.

## Query Params

- `q` _(string, optional)_: Từ khóa tìm kiếm (theo appointmentId, ngày, trạng thái)
- `page` _(number, optional)_: Trang hiện tại (bắt đầu từ 1)
- `limit` _(number, optional)_: Số lượng mỗi trang

## Response

- Nếu không truyền `q`, `page`, `limit`:
  ```json
  {
    "total": 2,
    "data": [
      {
        "_id": "...",
        "appointmentId": "AP123456",
        "patient": { ... },
        "doctor": { ... },
        "specialty": { ... },
        "status": "PENDING",
        "date": "2024-06-01",
        "slot": "08:00-08:30",
        "timezone": "Asia/Ho_Chi_Minh",
        ...
      }
    ]
  }
  ```
- Nếu có truyền `q`, `page`, `limit`:
  ```json
  {
    "total": 20,
    "page": 2,
    "limit": 5,
    "data": [ ... ]
  }
  ```

## Giải thích field

- `total`: Tổng số lịch hẹn tìm được
- `page`: Trang hiện tại (chỉ có khi truyền page/limit)
- `limit`: Số lượng mỗi trang (chỉ có khi truyền page/limit)
- `data`: Danh sách lịch hẹn (mỗi phần tử là 1 appointment, đầy đủ thông tin populate patient, doctor, specialty...)

> Nếu không truyền page/limit/q thì chỉ có `total` và `data`.
> Nếu có truyền page/limit/q thì có đủ `total`, `page`, `limit`, `data`.

## Quy tắc chuẩn hóa

- Response luôn theo format `{ total, data }` hoặc `{ total, page, limit, data }`.
- Nếu có thay đổi response phải update lại docs trước khi merge.
