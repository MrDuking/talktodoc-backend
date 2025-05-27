# Medicines Service API

## Tổng quan

Module này cung cấp các API để quản lý danh mục thuốc, import thuốc từ file CSV, và theo dõi tiến trình import. Dưới đây là hướng dẫn chi tiết cho frontend dễ tích hợp.

---

## 1. Lấy danh sách thuốc

- **Endpoint:** `GET /api/v1/medicines`
- **Query Params:**
  - `page`: Số trang (mặc định 1)
  - `limit`: Số lượng/trang (mặc định 10)
  - `keyword`: Tìm kiếm theo mã, tên, hoặc liều lượng

### Response mẫu

```json
{
  "data": [
    {
      "_id": "6650e2f2f8b2c001e7e7e7e7",
      "id": "P001",
      "name": "Paracetamol",
      "price": 5000,
      "quantity": "500mg",
      "createdAt": "2024-05-25T10:00:00.000Z",
      "updatedAt": "2024-05-25T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### Ý nghĩa các trường

| Trường      | Kiểu dữ liệu | Ý nghĩa                      |
| ----------- | ------------ | ---------------------------- |
| `_id`       | string       | MongoId của thuốc            |
| `id`        | string       | Mã thuốc (unique)            |
| `name`      | string       | Tên thuốc                    |
| `price`     | number       | Giá thuốc (VNĐ)              |
| `quantity`  | string       | Hàm lượng/liều lượng         |
| `createdAt` | string       | Thời gian tạo (ISODate)      |
| `updatedAt` | string       | Thời gian cập nhật (ISODate) |

---

## 2. Import thuốc từ file CSV

- **Endpoint:** `POST /api/v1/medicines/import`
- **Body:** `multipart/form-data` với trường `file` (CSV)
- **Response:**

```json
{
  "taskId": "1716630000000",
  "totalRows": 100,
  "success": { "count": 80, "lines": [1,2,3,...] },
  "updated": { "count": 10, "lines": [81,82,...] },
  "failed": { "count": 5, "lines": [{ "line": 90, "reason": "Thiếu cột dữ liệu" }] },
  "duplicates": { "count": 5, "lines": [95,96,...] }
}
```

#### Ý nghĩa

- `taskId`: ID để tra cứu tiến trình import
- `totalRows`: Tổng số dòng đọc được từ file
- `success`: Số dòng thêm mới thành công
- `updated`: Số dòng cập nhật thành công (trùng mã, khác thông tin)
- `failed`: Số dòng lỗi (thiếu dữ liệu, lỗi hệ thống)
- `duplicates`: Số dòng trùng hoàn toàn (không thay đổi)

---

## 3. Theo dõi tiến trình import

- **Endpoint:** `GET /api/v1/medicines/progress/:taskId`
- **Response:** (giống như khi import xong)

```json
{
  "taskId": "1716630000000",
  "totalRows": 100,
  "success": { "count": 80, "lines": [1,2,3,...] },
  "updated": { "count": 10, "lines": [81,82,...] },
  "failed": { "count": 5, "lines": [{ "line": 90, "reason": "Thiếu cột dữ liệu" }] },
  "duplicates": { "count": 5, "lines": [95,96,...] }
}
```

---

## 4. Cấu trúc file CSV import

- **Cột bắt buộc:** `ID`, `Name`, `Final Cost`, `Quanitty` (lưu ý typo: Quanitty)
- **Quy đổi giá:** `Final Cost` (GBP) sẽ được nhân 25 để ra VNĐ

---

## 5. Lưu ý cho Frontend

- Khi hiển thị danh sách thuốc, ưu tiên dùng các trường: `id`, `name`, `price`, `quantity`
- Khi import, có thể show tiến trình theo `taskId` để biết dòng nào lỗi, dòng nào thành công
- Nếu import trùng mã thuốc nhưng khác thông tin, sẽ tự động cập nhật
- Nếu trùng hoàn toàn, sẽ bỏ qua (đếm vào `duplicates`)
- Khi tìm kiếm, có thể search theo mã, tên, hoặc liều lượng (`keyword`)

---

## 6. Ví dụ hiển thị danh sách thuốc

| Mã thuốc | Tên thuốc   | Giá (VNĐ) | Liều lượng | Ngày tạo         |
| -------- | ----------- | --------- | ---------- | ---------------- |
| P001     | Paracetamol | 5,000     | 500mg      | 25/05/2024 10:00 |

---

Nếu cần thêm chi tiết về cấu trúc hoặc muốn custom response, hãy gửi yêu cầu cụ thể!
