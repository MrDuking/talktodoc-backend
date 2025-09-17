# Test Examples cho JSON Response Logic

## Test Case 1: Có cả requireJsonResponse và jsonResponseType

### Request
```bash
curl -X POST 'http://localhost:3000/chat/conv123/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Tôi muốn đặt lịch khám bệnh, tôi bị đau đầu và mệt mỏi",
    "user_id": "user_123",
    "requireJsonResponse": true,
    "jsonResponseType": "appointment_suggestion"
  }'
```

### Expected Response
```json
{
  "success": true,
  "reply": "Tôi hiểu bạn muốn đặt lịch khám bệnh. Dựa trên triệu chứng đau đầu và mệt mỏi của bạn, tôi gợi ý bạn nên khám với bác sĩ nội khoa để được tư vấn và kiểm tra tổng quát.",
  "jsonData": {
    "type": "appointment_suggestion",
    "data": {
      "suggested": true,
      "reason": "Dựa trên triệu chứng và lịch sử khám bệnh",
      "recommendedSpecialties": ["nội khoa"],
      "availableDoctors": [
        {
          "doctorId": "doc_789",
          "doctorName": "BS. Nguyễn Văn A",
          "doctorSpecialty": "Nội khoa",
          "nextAvailable": "2024-01-20T09:00:00Z"
        }
      ],
      "estimatedDuration": 30,
      "price": 500000,
      "confirmationRequired": true
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o-mini"
}
```

## Test Case 2: Chỉ có requireJsonResponse

### Request
```bash
curl -X POST 'http://localhost:3000/chat/conv123/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Lịch hẹn của tôi",
    "user_id": "user_123",
    "requireJsonResponse": true
  }'
```

### Expected Response
```json
{
  "success": true,
  "reply": "```json\n{\n  \"type\": \"appointment_info\",\n  \"data\": {\n    \"hasAppointment\": true,\n    \"totalAppointments\": 2,\n    \"nextAppointment\": {\n      \"appointmentId\": \"apt_456\",\n      \"date\": \"2024-01-25\",\n      \"slot\": \"14:00\",\n      \"status\": \"confirmed\"\n    }\n  }\n}\n```",
  "jsonData": {
    "type": "appointment_info",
    "data": {
      "hasAppointment": true,
      "totalAppointments": 2,
      "nextAppointment": {
        "appointmentId": "apt_456",
        "date": "2024-01-25",
        "slot": "14:00",
        "status": "confirmed"
      }
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o-mini"
}
```

## Test Case 3: Chỉ có jsonResponseType

### Request
```bash
curl -X POST 'http://localhost:3000/chat/conv123/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Phân tích triệu chứng của tôi",
    "user_id": "user_123",
    "jsonResponseType": "symptom_analysis"
  }'
```

### Expected Response
```json
{
  "success": true,
  "reply": "```json\n{\n  \"type\": \"symptom_analysis\",\n  \"data\": {\n    \"symptoms\": [\"đau đầu\", \"mệt mỏi\"],\n    \"severity\": \"moderate\",\n    \"possibleConditions\": [\"căng thẳng\", \"thiếu ngủ\"],\n    \"recommendations\": [\"nghỉ ngơi\", \"uống đủ nước\"]\n  }\n}\n```",
  "jsonData": {
    "type": "symptom_analysis",
    "data": {
      "symptoms": ["đau đầu", "mệt mỏi"],
      "severity": "moderate",
      "possibleConditions": ["căng thẳng", "thiếu ngủ"],
      "recommendations": ["nghỉ ngơi", "uống đủ nước"]
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o-mini"
}
```

## Test Case 4: Không có params JSON

### Request
```bash
curl -X POST 'http://localhost:3000/chat/conv123/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Xin chào, bạn khỏe không?",
    "user_id": "user_123"
  }'
```

### Expected Response
```json
{
  "success": true,
  "reply": "Xin chào! Tôi khỏe, cảm ơn bạn đã hỏi. Tôi là trợ lý AI TalkToDoc, có thể hỗ trợ bạn về các vấn đề sức khỏe. Bạn cần tôi giúp gì không?",
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o-mini"
}
```

## Key Differences

### Test Case 1 (Có cả 2 params)
- `reply`: Chỉ chứa text, không có JSON markdown
- `jsonData`: Chứa dữ liệu JSON có cấu trúc
- Logic: Tách biệt hoàn toàn text và JSON

### Test Case 2 & 3 (Chỉ có 1 param)
- `reply`: Có thể chứa JSON markdown
- `jsonData`: Dữ liệu JSON được parse từ reply
- Logic: Theo cách cũ, parse JSON từ reply

### Test Case 4 (Không có params)
- `reply`: Text bình thường
- `jsonData`: undefined
- Logic: Chat thông thường

## Validation Points

1. **Test Case 1**: Đảm bảo `reply` không chứa `\`\`\`json` và `jsonData` có đúng structure
2. **Test Case 2 & 3**: Đảm bảo `jsonData` được parse đúng từ `reply`
3. **Test Case 4**: Đảm bảo không có `jsonData`
4. **All Cases**: Đảm bảo conversation được lưu với `finalReply` (không phải reply gốc)
