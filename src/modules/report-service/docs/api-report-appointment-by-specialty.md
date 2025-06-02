# 📊 API Report Lịch Hẹn Theo Chuyên Khoa

## 1. Endpoint

```
POST /report/appointment-by-specialty
```

---

## 2. Các chế độ thống kê (3 mode)

### a. Theo năm (Year)

- **Request:**

```json
{
  "years": [2023, 2024]
}
```

- **Response:**

```json
{
  "message": "Success",
  "data": [
    {
      "year": 2023,
      "specialties": [
        { "name": "Nội tổng quát", "monthly": [10, 20, ..., 18] },
        { "name": "Nhi khoa", "monthly": [5, 8, ..., 13] }
      ]
    },
    {
      "year": 2024,
      "specialties": [
        { "name": "Nội tổng quát", "monthly": [12, 18, ..., 20] },
        { "name": "Nhi khoa", "monthly": [7, 10, ..., 15] }
      ]
    }
  ],
  "status": 200
}
```

- **FE mapping:**
  - `categories`: 12 tháng ("Tháng 1" ... "Tháng 12")
  - `series`: mỗi năm là 1 tab, mỗi chuyên khoa là 1 line

---

### b. Theo tháng (Month)

- **Request:**

```json
{
  "years": [2024],
  "months": [5, 6]
}
```

- **Response:**

```json
{
  "message": "Success",
  "data": [
    {
      "year": 2024,
      "specialties": [
        { "name": "Nội tổng quát", "monthly": [18, 20] },
        { "name": "Nhi khoa", "monthly": [10, 12] }
      ]
    }
  ],
  "status": 200
}
```

- **FE mapping:**
  - `categories`: các tháng chỉ định ("Tháng 5", "Tháng 6", ...)
  - `series`: mỗi chuyên khoa là 1 line, data là mảng số lượng theo từng tháng

---

### c. Theo khoảng thời gian (Range)

- **Request:**

```json
{
  "startDate": "2024-05-01",
  "endDate": "2024-08-01"
}
```

- **Response:**

```json
{
  "message": "Success",
  "data": {
    "categories": ["Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8"],
    "series": [
      {
        "year": "2024",
        "series": [
          { "name": "Nội tổng quát", "data": [18, 20, 22, 19] },
          { "name": "Nhi khoa", "data": [10, 12, 13, 11] }
        ]
      }
    ]
  },
  "status": 200
}
```

- **FE mapping:**
  - `categories`: các tháng trong range
  - `series`: mỗi chuyên khoa là 1 line, data là mảng số lượng theo từng tháng

---

## 3. Giải thích các trường

- **year**: Năm thống kê (number hoặc string)
- **specialties**: Mảng các chuyên khoa trong năm đó
  - **name**: Tên chuyên khoa (string)
  - **monthly**: Mảng số lượng lịch hẹn theo từng tháng (nếu mode year/month)
- **categories**: Mảng tên tháng (nếu mode range)
- **series**: Mỗi năm là 1 tab, mỗi chuyên khoa là 1 line
  - **series[].year**: Năm (string)
  - **series[].series**: Mảng các chuyên khoa, mỗi chuyên khoa có `name` và `data` (mảng số lượng theo tháng)

---

## 4. Quy tắc chung

- **Format response:**
  - Mode year/month: `{ message, data: [ ... ], status }`
  - Mode range: `{ message, data: { categories, series }, status }`
- **Trả về lỗi rõ ràng nếu không có dữ liệu hoặc sai tham số**
- **Đảm bảo performance tốt với nhiều năm và nhiều chuyên khoa**
- **Kiểm tra quyền truy cập (role-based) nếu cần**

---

## 5. Hướng dẫn test Swagger

- Truy cập `/api` (hoặc `/swagger` tuỳ cấu hình)
- Tìm group **Reports** > **POST /report/appointment-by-specialty**
- Chọn 1 trong 3 mode:
  - **Theo năm:** `{ "years": [2023, 2024] }`
  - **Theo tháng:** `{ "years": [2024], "months": [5, 6] }`
  - **Theo range:** `{ "startDate": "2024-05-01", "endDate": "2024-08-01" }`
- Xem ví dụ response mẫu cho từng mode ngay trên Swagger UI

---

## 6. Lưu ý cho Backend

- Nếu truyền cả 3 (`years`, `months`, `startDate`, `endDate`), ưu tiên mode range.
- Nếu không truyền gì hợp lệ sẽ báo lỗi.
- Đảm bảo đúng format docs FE mới nhất.
- Nếu cần bổ sung thêm trường (ví dụ: tổng số lịch hẹn cả năm, top chuyên khoa, ...) hãy liên hệ FE để thống nhất!
