# JSON Response Logic Update

## Tổng quan

Cập nhật logic xử lý JSON response trong Chat API để hỗ trợ việc tách biệt giữa message text và JSON data.

## Logic mới

### 1. Khi có cả `jsonResponseType` và `requireJsonResponse`

```json
{
  "message": "Tôi muốn khám bệnh",
  "user_id": "user_123",
  "requireJsonResponse": true,
  "jsonResponseType": "appointment_suggestion"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "Tôi hiểu bạn muốn khám bệnh. Dựa trên triệu chứng của bạn, tôi gợi ý bạn nên khám với bác sĩ nội khoa.",
  "jsonData": {
    "type": "appointment_suggestion",
    "data": {
      "suggested": true,
      "reason": "Dựa trên triệu chứng và lịch sử khám bệnh",
      "recommendedSpecialties": ["nội khoa"],
      "availableDoctors": [...]
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o-mini"
}
```

**Đặc điểm:**
- `reply`: Text bình thường, không chứa JSON
- `jsonData`: Dữ liệu JSON có cấu trúc
- Nếu AI trả về JSON trong reply, sẽ tự động tách ra và đưa vào `jsonData`

### 2. Khi chỉ có `requireJsonResponse` hoặc `jsonResponseType`

```json
{
  "message": "Lịch hẹn của tôi",
  "user_id": "user_123",
  "requireJsonResponse": true
}
```

**Response:**
```json
{
  "success": true,
  "reply": "```json\n{\n  \"type\": \"appointment_info\",\n  \"data\": {\n    \"hasAppointment\": true,\n    \"totalAppointments\": 2\n  }\n}\n```",
  "jsonData": {
    "type": "appointment_info",
    "data": {
      "hasAppointment": true,
      "totalAppointments": 2
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o-mini"
}
```

**Đặc điểm:**
- `reply`: Có thể chứa JSON markdown hoặc text bình thường
- `jsonData`: Dữ liệu JSON được parse từ reply (nếu có)

## Các trường hợp xử lý

### Trường hợp 1: AI trả về JSON trong reply
- **Có cả 2 params**: Tách JSON ra khỏi reply, đưa vào `jsonData`
- **Chỉ có 1 param**: Parse JSON và đưa vào `jsonData`, giữ nguyên reply

### Trường hợp 2: AI không trả về JSON nhưng có `jsonResponseType`
- **Có cả 2 params**: Generate JSON dựa trên type, reply là text mô tả
- **Chỉ có `jsonResponseType`**: Generate JSON và đưa vào `jsonData`

### Trường hợp 3: Chỉ có `requireJsonResponse`
- Xử lý theo logic cũ: tìm JSON trong reply và parse

## Lợi ích

1. **Tách biệt rõ ràng**: Message text và JSON data được tách biệt hoàn toàn
2. **Linh hoạt**: Hỗ trợ cả 2 cách sử dụng (cũ và mới)
3. **Tự động**: Tự động detect và xử lý JSON trong response
4. **Backward compatible**: Không ảnh hưởng đến logic cũ

## Ví dụ sử dụng

### Frontend muốn hiển thị text + JSON
```javascript
const response = await fetch('/chat/conv123/json', {
  method: 'POST',
  body: JSON.stringify({
    message: "Tôi muốn đặt lịch khám",
    user_id: "user_123",
    requireJsonResponse: true,
    jsonResponseType: "appointment_suggestion"
  })
});

const data = await response.json();
// data.reply: "Tôi hiểu bạn muốn đặt lịch khám..."
// data.jsonData: { type: "appointment_suggestion", data: {...} }
```

### Frontend chỉ muốn JSON
```javascript
const response = await fetch('/chat/conv123/json', {
  method: 'POST',
  body: JSON.stringify({
    message: "Lịch hẹn của tôi",
    user_id: "user_123",
    requireJsonResponse: true
  })
});

const data = await response.json();
// data.reply: có thể chứa JSON markdown
// data.jsonData: JSON parsed data
```
