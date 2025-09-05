# 🤖 Chat JSON Response API Documentation

## 📋 Tổng quan

API này cho phép chatbot trả lời với JSON data có cấu trúc, giúp frontend có thể xử lý và hiển thị thông tin một cách linh hoạt hơn.

---

## 🚀 API Endpoint

### POST /chat/:conversationId/json

**Mô tả**: Gửi tin nhắn và nhận phản hồi từ AI với JSON data có cấu trúc

**Headers**:
```
Content-Type: application/json
```

---

## 📥 Request Format

```json
{
  "message": "Tôi muốn kiểm tra lịch hẹn của mình",
  "user_id": "user_123",
  "imageUrls": ["https://example.com/image1.jpg"],
  "model": "gpt-4o",
  "requireJsonResponse": true,
  "jsonResponseType": "appointment_info"
}
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | ✅ | Tin nhắn từ user |
| `user_id` | string | ✅ | ID của user |
| `imageUrls` | string[] | ❌ | Danh sách URL ảnh |
| `model` | string | ❌ | Model AI để sử dụng |
| `requireJsonResponse` | boolean | ❌ | Có yêu cầu JSON response không |
| `jsonResponseType` | string | ❌ | Loại JSON response mong muốn |

### JSON Response Types

- `appointment_info`: Thông tin lịch hẹn
- `appointment_suggestion`: Gợi ý đặt lịch
- `symptom_analysis`: Phân tích triệu chứng
- `patient_info`: Thông tin bệnh nhân
- `general_info`: Thông tin chung

---

## 📤 Response Format

```json
{
  "success": true,
  "reply": "Dựa trên lịch sử khám bệnh của bạn, bạn có 2 lịch hẹn sắp tới...",
  "jsonData": {
    "type": "appointment_info",
    "data": {
      "hasAppointment": true,
      "totalAppointments": 2,
      "nextAppointment": {
        "appointmentId": "APT-20240901-0001",
        "date": "2024-01-20",
        "slot": "14:00",
        "status": "CONFIRMED",
        "reason": "Tái khám kiểm tra đường huyết"
      },
      "recentAppointments": [
        {
          "appointmentId": "APT-20240901-0001",
          "date": "2024-01-20",
          "slot": "14:00",
          "status": "CONFIRMED"
        },
        {
          "appointmentId": "APT-20240815-0002",
          "date": "2024-01-15",
          "slot": "10:00",
          "status": "COMPLETED"
        }
      ]
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 150,
    "outputTokens": 200,
    "totalTokens": 350
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `reply` | string | Phản hồi text từ AI |
| `jsonData` | object | JSON data có cấu trúc (optional) |
| `jsonData.type` | string | Loại JSON response |
| `jsonData.data` | object | Dữ liệu JSON |
| `timestamp` | string | Thời gian phản hồi |
| `model` | string | Model AI được sử dụng |
| `usage` | object | Thông tin token usage |

---

## 🔧 JSON Response Types

### 1. appointment_info

```json
{
  "type": "appointment_info",
  "data": {
    "hasAppointment": true,
    "totalAppointments": 2,
    "nextAppointment": {
      "appointmentId": "APT-20240901-0001",
      "date": "2024-01-20",
      "slot": "14:00",
      "status": "CONFIRMED",
      "reason": "Tái khám kiểm tra đường huyết"
    },
    "recentAppointments": [...]
  }
}
```

### 2. appointment_suggestion

```json
{
  "type": "appointment_suggestion",
  "data": {
    "suggested": true,
    "reason": "Dựa trên triệu chứng và lịch sử khám bệnh",
    "urgency": "normal",
    "recommendedSpecialty": "nội khoa",
    "recommendedSpecialties": ["nội khoa", "thần kinh"],
    "detectedSymptoms": ["đau đầu", "mệt mỏi"],
    "estimatedWaitTime": "2-3 ngày",
    "availableDoctors": [
      {
        "id": "66f0d2b1b8c8a13a5d0c1e22",
        "doctorId": "DR123456",
        "name": "BS. Nguyễn Văn A",
        "specialty": [
          {
            "id": "66f0d2b1b8c8a13a5d0c1e33",
            "name": "Nội khoa",
            "description": "Chuyên khoa nội tổng quát"
          }
        ],
        "experienceYears": 5,
        "rating": 4.8,
        "position": "Bác sĩ chuyên khoa",
        "hospital": "66f0d2b1b8c8a13a5d0c1e44",
        "nextAvailableSlot": "2024-01-21 09:00-10:00"
      }
    ],
    "suggestedTimeSlots": [
      {
        "date": "2024-01-21",
        "dayOfWeek": "Chủ nhật",
        "slots": [
          {
            "time": "09:00-10:00",
            "timeStart": "09:00",
            "timeEnd": "10:00",
            "available": true,
            "price": 250000
          },
          {
            "time": "10:00-11:00",
            "timeStart": "10:00",
            "timeEnd": "11:00",
            "available": true,
            "price": 250000
          }
        ]
      }
    ],
    "pricing": {
      "platformFee": 50000,
      "doctorFee": 250000,
      "discount": 0,
      "total": 300000,
      "currency": "VND"
    },
    "bookingInfo": {
      "minAdvanceBooking": "2 giờ",
      "maxAdvanceBooking": "30 ngày",
      "cancellationPolicy": "Hủy miễn phí trước 2 giờ",
      "reschedulePolicy": "Đổi lịch miễn phí trước 4 giờ"
    }
  }
}
```

### 3. symptom_analysis

```json
{
  "type": "symptom_analysis",
  "data": {
    "symptoms": ["đau đầu", "mệt mỏi"],
    "severity": "mild",
    "recommendation": "Khám bác sĩ để được tư vấn cụ thể",
    "suggestedSpecialty": "nội khoa"
  }
}
```

### 4. patient_info

```json
{
  "type": "patient_info",
  "data": {
    "hasInfo": true,
    "name": "Nguyễn Văn A",
    "age": 30,
    "gender": "Nam",
    "phone": "0123456789"
  }
}
```

### 5. general_info

```json
{
  "type": "general_info",
  "data": {
    "message": "Xin chào! Tôi có thể giúp gì cho bạn?",
    "timestamp": "2024-01-20T18:00:00Z"
  }
}
```

---

## 💡 Usage Examples

### Example 1: Kiểm tra lịch hẹn

```bash
curl -X POST "http://localhost:3000/chat/conv_123/json" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tôi muốn kiểm tra lịch hẹn của mình",
    "user_id": "user_123",
    "requireJsonResponse": true,
    "jsonResponseType": "appointment_info"
  }'
```

### Example 2: Phân tích triệu chứng

```bash
curl -X POST "http://localhost:3000/chat/conv_123/json" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tôi bị đau đầu và mệt mỏi nhiều ngày",
    "user_id": "user_123",
    "requireJsonResponse": true,
    "jsonResponseType": "symptom_analysis"
  }'
```

### Example 3: Gợi ý đặt lịch

```bash
curl -X POST "http://localhost:3000/chat/conv_123/json" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tôi muốn đặt lịch khám bệnh",
    "user_id": "user_123",
    "requireJsonResponse": true,
    "jsonResponseType": "appointment_suggestion"
  }'
```

---

## 🎯 Frontend Integration

### React Example

```typescript
const sendJsonMessage = async (message: string, responseType?: string) => {
  try {
    const response = await fetch(`/api/chat/${conversationId}/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user_id: userId,
        requireJsonResponse: true,
        jsonResponseType: responseType
      })
    })

    const data = await response.json()
    
    // Hiển thị text response
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: data.reply
    }])

    // Xử lý JSON data
    if (data.jsonData) {
      handleJsonData(data.jsonData)
    }
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const handleJsonData = (jsonData: any) => {
  switch (jsonData.type) {
    case 'appointment_info':
      // Hiển thị thông tin lịch hẹn
      showAppointmentInfo(jsonData.data)
      break
    case 'appointment_suggestion':
      // Hiển thị gợi ý đặt lịch
      showAppointmentSuggestion(jsonData.data)
      break
    case 'symptom_analysis':
      // Hiển thị phân tích triệu chứng
      showSymptomAnalysis(jsonData.data)
      break
    default:
      console.log('Unknown JSON type:', jsonData.type)
  }
}
```

---

## 🔄 Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-20T18:00:00Z"
}
```

### Common Error Codes

- `CONVERSATION_NOT_FOUND`: Conversation không tồn tại
- `INVALID_JSON_TYPE`: Loại JSON response không hợp lệ
- `AI_SERVICE_ERROR`: Lỗi từ AI service
- `VALIDATION_ERROR`: Dữ liệu request không hợp lệ

---

## 🚀 Advanced Features

### 1. Auto JSON Detection

Nếu không chỉ định `jsonResponseType`, AI sẽ tự động detect và trả về JSON phù hợp:

```json
{
  "message": "Lịch hẹn của tôi khi nào?",
  "user_id": "user_123",
  "requireJsonResponse": true
}
```

### 2. Image Analysis

Hỗ trợ phân tích ảnh và trả về JSON:

```json
{
  "message": "Tôi gửi ảnh triệu chứng",
  "user_id": "user_123",
  "imageUrls": ["https://example.com/symptom.jpg"],
  "requireJsonResponse": true,
  "jsonResponseType": "symptom_analysis"
}
```

### 3. Context Awareness

API tự động lấy thông tin bệnh nhân và lịch hẹn để cung cấp JSON data chính xác.

---

## 📊 Performance

- **Response Time**: ~2-5 giây (tùy thuộc vào độ phức tạp)
- **Token Usage**: Được trả về trong response
- **Rate Limiting**: 100 requests/minute per user
- **Caching**: JSON responses được cache 5 phút

---

## 🔧 Testing

### Test với Swagger UI

1. Truy cập: `http://localhost:3000/api/docs`
2. Tìm endpoint `POST /chat/{conversationId}/json`
3. Test với các JSON response types khác nhau

### Test với cURL

```bash
# Test appointment info
curl -X POST "http://localhost:3000/chat/test_conv/json" \
  -H "Content-Type: application/json" \
  -d '{"message": "Lịch hẹn của tôi", "user_id": "test_user", "requireJsonResponse": true, "jsonResponseType": "appointment_info"}'
```

---

> **Lưu ý**: API này được thiết kế để tương thích với hệ thống hiện tại và có thể mở rộng thêm các JSON response types mới trong tương lai.
