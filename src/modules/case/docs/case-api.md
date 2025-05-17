# Tài liệu API Bệnh án (Case)

## Tổng quan

Module này cung cấp các API để quản lý bệnh án (case) cho bệnh nhân, bao gồm tạo/cập nhật, lấy danh sách, chi tiết, kê đơn thuốc, và xoá mềm.

---

## 1. Tạo/Cập nhật bệnh án

- **Endpoint:** `POST /case/data`
- **Yêu cầu xác thực:** Bearer Token
- **Request Body:**

```json
{
  "case_id": "string (MongoId)",
  "appointment_id": "string (MongoId, optional)",
  "medical_form": {
    "symptoms": "Đau đầu 3 ngày",
    "questions": [
      { "question": "Có tiền sử cao huyết áp?", "answer": "Không" },
      { "question": "Có đang căng thẳng không?", "answer": "Có" }
    ],
    "note": "Bệnh nhân có biểu hiện nhẹ, nên theo dõi thêm"
  },
  "action": "save | submit | sendback"
}
```

- **Giải thích:**
  - `case_id`: ID bệnh án cần cập nhật.
  - `appointment_id`: ID lịch hẹn (bắt buộc khi submit lần đầu).
  - `medical_form`: Dữ liệu form triệu chứng, câu hỏi tư vấn.
  - `action`:
    - `save`: Lưu tạm.
    - `submit`: Gửi lên hệ thống (có thể cần appointment_id).
    - `sendback`: Trả lại trạng thái nháp.
- **Response:**

```json
{ "message": "Đã lưu bệnh án tạm thời" }
{ "message": "Cập nhật bệnh án thành công" }
{ "message": "Đã trả bệnh án về trạng thái nháp" }
```

- **Lỗi thường gặp:**
  - 400: Thiếu trường bắt buộc, quyền truy cập, trạng thái không hợp lệ.
  - 404: Không tìm thấy bệnh án.

---

## 2. Lấy danh sách bệnh án

- **Endpoint:** `GET /case`
- **Yêu cầu xác thực:** Bearer Token
- **Query Params:**
  - `q`: Từ khoá tìm kiếm (triệu chứng, ghi chú)
  - `status`: Trạng thái (`draft`, `pending`, `assigned`, `completed`)
  - `page`: Trang (mặc định 1)
  - `limit`: Số lượng/trang (mặc định 10)
- **Response:**

```json
{
  "total": 2,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "_id": "string",
      "patient": "string",
      "specialty": "string",
      "medicalForm": { ... },
      "appointmentId": "string",
      "status": "draft | pending | assigned | completed",
      "offers": [ ... ],
      "isDeleted": false,
      "createdAt": "ISODate",
      "updatedAt": "ISODate"
    }
  ]
}
```

---

## 3. Lấy chi tiết bệnh án

- **Endpoint:** `GET /case/:id`
- **Yêu cầu xác thực:** Bearer Token
- **Response:**

```json
{
  "_id": "string",
  "patient": { ... },
  "specialty": { ... },
  "medicalForm": { ... },
  "appointmentId": { ... },
  "status": "draft | pending | assigned | completed",
  "offers": [
    {
      "createdAt": "ISODate",
      "createdBy": { "_id": "string", "fullName": "Bác sĩ" },
      "note": "string",
      "medications": [
        {
          "medicationId": "string",
          "name": "string",
          "dosage": "string",
          "usage": "string",
          "duration": "string"
        }
      ]
    }
  ],
  "isDeleted": false,
  "createdAt": "ISODate",
  "updatedAt": "ISODate",
  "offerSummary": [
    {
      "date": "DD/MM/YYYY",
      "doctor": "string",
      "summary": "string"
    }
  ]
}
```

- **Lỗi thường gặp:**
  - 400: Không có quyền truy cập.
  - 404: Không tìm thấy bệnh án.

---

## 4. Bác sĩ kê đơn thuốc (thêm offer)

- **Endpoint:** `PATCH /case/:id/offer`
- **Yêu cầu xác thực:** Bearer Token, role `DOCTOR`
- **Request Body:**

```json
{
  "note": "string (optional)",
  "medications": [
    {
      "medicationId": "string (MongoId)",
      "dosage": "string",
      "usage": "string",
      "duration": "string"
    }
  ]
}
```

- **Response:**

```json
{ "message": "Đã thêm đơn thuốc thành công" }
```

- **Lỗi thường gặp:**
  - 400: Thiếu trường, thuốc không hợp lệ, quyền truy cập.
  - 404: Không tìm thấy bệnh án.

---

## 5. Xoá mềm bệnh án

- **Endpoint:** `PATCH /case/:id/delete`
- **Yêu cầu xác thực:** Bearer Token
- **Response:**

```json
{ "message": "Đã xoá bệnh án (ẩn khỏi danh sách)" }
```

- **Lỗi thường gặp:**
  - 400: Không có quyền xoá.
  - 404: Không tìm thấy bệnh án.

---

## 6. Lưu ý

- Tất cả endpoint đều yêu cầu xác thực JWT.
- Chỉ bệnh nhân sở hữu case mới được cập nhật/xoá case của mình.
- Bác sĩ chỉ được phép kê đơn khi case ở trạng thái phù hợp.
- Trường `status` hợp lệ: `draft`, `pending`, `assigned`, `completed`.
- Trường `action` hợp lệ: `save`, `submit`, `sendback`.

---

## 7. Liên hệ

- Backend: [Tên, email]
- Frontend: [Tên, email]
