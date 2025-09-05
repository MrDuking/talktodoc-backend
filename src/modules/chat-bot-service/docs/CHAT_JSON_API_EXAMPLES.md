# 🧪 Chat JSON API - Test Examples

## 📋 Test Cases

### 1. Test Appointment Info Request

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

**Expected Response:**
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

### 2. Test Symptom Analysis Request

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

**Expected Response:**
```json
{
  "success": true,
  "reply": "Dựa trên triệu chứng bạn mô tả, tôi thấy bạn có dấu hiệu đau đầu và mệt mỏi...",
  "jsonData": {
    "type": "symptom_analysis",
    "data": {
      "symptoms": ["đau đầu", "mệt mỏi"],
      "severity": "mild",
      "recommendation": "Khám bác sĩ để được tư vấn cụ thể",
      "suggestedSpecialty": "nội khoa"
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 120,
    "outputTokens": 180,
    "totalTokens": 300
  }
}
```

### 3. Test Appointment Suggestion Request

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

**Expected Response:**
```json
{
  "success": true,
  "reply": "Tôi có thể giúp bạn đặt lịch khám bệnh. Dựa trên thông tin hiện tại, tôi gợi ý một số bác sĩ phù hợp...",
  "jsonData": {
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
        },
        {
          "id": "66f0d2b1b8c8a13a5d0c1e25",
          "doctorId": "DR789012",
          "name": "BS. Trần Thị B",
          "specialty": [
            {
              "id": "66f0d2b1b8c8a13a5d0c1e35",
              "name": "Thần kinh",
              "description": "Chuyên khoa thần kinh"
            }
          ],
          "experienceYears": 8,
          "rating": 4.9,
          "position": "Bác sĩ trưởng khoa",
          "hospital": "66f0d2b1b8c8a13a5d0c1e44",
          "nextAvailableSlot": "2024-01-22 14:00-15:00"
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
        },
        {
          "date": "2024-01-22",
          "dayOfWeek": "Thứ hai",
          "slots": [
            {
              "time": "14:00-15:00",
              "timeStart": "14:00",
              "timeEnd": "15:00",
              "available": true,
              "price": 300000
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
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 100,
    "outputTokens": 200,
    "totalTokens": 300
  }
}
```

### 4. Test Patient Info Request

```bash
curl -X POST "http://localhost:3000/chat/conv_123/json" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Thông tin cá nhân của tôi như thế nào?",
    "user_id": "user_123",
    "requireJsonResponse": true,
    "jsonResponseType": "patient_info"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "reply": "Dựa trên hồ sơ bệnh án của bạn, thông tin cá nhân hiện tại...",
  "jsonData": {
    "type": "patient_info",
    "data": {
      "hasInfo": true,
      "name": "Nguyễn Văn A",
      "age": "1990-01-01",
      "gender": "Nam",
      "phone": "0123456789"
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 80,
    "outputTokens": 120,
    "totalTokens": 200
  }
}
```

### 5. Test General Info Request (Auto-detect)

```bash
curl -X POST "http://localhost:3000/chat/conv_123/json" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Xin chào, bạn có thể giúp gì cho tôi?",
    "user_id": "user_123",
    "requireJsonResponse": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "reply": "Xin chào! Tôi là trợ lý AI TalkToDoc, tôi có thể giúp bạn...",
  "jsonData": {
    "type": "general_info",
    "data": {
      "message": "Xin chào! Tôi là trợ lý AI TalkToDoc, tôi có thể giúp bạn...",
      "timestamp": "2024-01-20T18:00:00Z"
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 60,
    "outputTokens": 100,
    "totalTokens": 160
  }
}
```

### 6. Test with Image Analysis

```bash
curl -X POST "http://localhost:3000/chat/conv_123/json" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tôi gửi ảnh triệu chứng, bạn có thể phân tích không?",
    "user_id": "user_123",
    "imageUrls": ["https://example.com/symptom.jpg"],
    "requireJsonResponse": true,
    "jsonResponseType": "symptom_analysis"
  }'
```

---

## 🔧 Frontend Integration Examples

### React Hook Example

```typescript
import { useState } from 'react'

interface ChatJsonResponse {
  success: boolean
  reply: string
  jsonData?: {
    type: string
    data: Record<string, unknown>
  }
  timestamp: string
  model: string
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

export const useChatJson = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendJsonMessage = async (
    conversationId: string,
    message: string,
    userId: string,
    options?: {
      jsonResponseType?: string
      imageUrls?: string[]
      model?: string
    }
  ): Promise<ChatJsonResponse | null> => {
    setLoading(true)
    setError(null)

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
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { sendJsonMessage, loading, error }
}
```

### Usage in Component

```typescript
import React, { useState } from 'react'
import { useChatJson } from './hooks/useChatJson'

const ChatComponent: React.FC = () => {
  const [conversationId] = useState('conv_123')
  const [userId] = useState('user_123')
  const [messages, setMessages] = useState<any[]>([])
  const { sendJsonMessage, loading, error } = useChatJson()

  const handleSendMessage = async (message: string, responseType?: string) => {
    const response = await sendJsonMessage(conversationId, message, userId, {
      jsonResponseType: responseType,
    })

    if (response) {
      // Add user message
      setMessages(prev => [...prev, {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }])

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.reply,
        jsonData: response.jsonData,
        timestamp: response.timestamp,
        model: response.model
      }])

      // Handle JSON data
      if (response.jsonData) {
        handleJsonData(response.jsonData)
      }
    }
  }

  const handleJsonData = (jsonData: any) => {
    switch (jsonData.type) {
      case 'appointment_info':
        // Show appointment info modal
        console.log('Appointment info:', jsonData.data)
        break
      case 'appointment_suggestion':
        // Show appointment suggestion modal with doctor selection
        console.log('Appointment suggestion:', jsonData.data)
        showAppointmentBookingModal(jsonData.data)
        break
      case 'symptom_analysis':
        // Show symptom analysis results
        console.log('Symptom analysis:', jsonData.data)
        break
      case 'patient_info':
        // Show patient info
        console.log('Patient info:', jsonData.data)
        break
      default:
        console.log('General info:', jsonData.data)
    }
  }

  const showAppointmentBookingModal = (data: any) => {
    // Hiển thị modal đặt lịch với thông tin chi tiết
    const { availableDoctors, suggestedTimeSlots, pricing, bookingInfo } = data
    
    // Có thể tạo một modal component để hiển thị:
    // - Danh sách bác sĩ với rating, kinh nghiệm
    // - Lịch trống theo ngày
    // - Giá cả chi tiết
    // - Thông tin chính sách hủy/đổi lịch
    
    console.log('Available doctors:', availableDoctors)
    console.log('Time slots:', suggestedTimeSlots)
    console.log('Pricing:', pricing)
    console.log('Booking info:', bookingInfo)
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="content">{msg.content}</div>
            {msg.jsonData && (
              <div className="json-data">
                <pre>{JSON.stringify(msg.jsonData, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <button 
          onClick={() => handleSendMessage('Kiểm tra lịch hẹn', 'appointment_info')}
          disabled={loading}
        >
          Kiểm tra lịch hẹn
        </button>
        <button 
          onClick={() => handleSendMessage('Tôi bị đau đầu', 'symptom_analysis')}
          disabled={loading}
        >
          Phân tích triệu chứng
        </button>
        <button 
          onClick={() => handleSendMessage('Đặt lịch khám', 'appointment_suggestion')}
          disabled={loading}
        >
          Đặt lịch khám
        </button>
      </div>
      
      {loading && <div>Đang xử lý...</div>}
      {error && <div className="error">Lỗi: {error}</div>}
    </div>
  )
}

export default ChatComponent
```

---

## 🚀 Performance Testing

### Load Test Script

```bash
#!/bin/bash

# Test multiple concurrent requests
for i in {1..10}; do
  curl -X POST "http://localhost:3000/chat/conv_$i/json" \
    -H "Content-Type: application/json" \
    -d '{
      "message": "Test message '$i'",
      "user_id": "user_'$i'",
      "requireJsonResponse": true,
      "jsonResponseType": "general_info"
    }' &
done

wait
echo "All requests completed"
```

### Response Time Monitoring

```typescript
const measureResponseTime = async (requestFn: () => Promise<any>) => {
  const start = Date.now()
  const response = await requestFn()
  const end = Date.now()
  
  console.log(`Response time: ${end - start}ms`)
  console.log(`Token usage:`, response.usage)
  
  return response
}
```

---

## 📊 Expected Performance Metrics

- **Response Time**: 2-5 seconds
- **Token Usage**: 100-500 tokens per request
- **Success Rate**: >95%
- **Concurrent Users**: 100+ users
- **Rate Limit**: 100 requests/minute per user

---

## 🔍 Debugging Tips

### 1. Check API Response

```bash
# Verbose curl output
curl -v -X POST "http://localhost:3000/chat/conv_123/json" \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "user_id": "user_123", "requireJsonResponse": true}'
```

### 2. Monitor Logs

```bash
# Watch application logs
tail -f logs/app.log | grep "ChatJson"
```

### 3. Test with Swagger UI

1. Go to `http://localhost:3000/api/docs`
2. Find `POST /chat/{conversationId}/json`
3. Test with different parameters

### 4. Validate JSON Response

```typescript
const validateJsonResponse = (response: any) => {
  if (!response.success) {
    console.error('API returned error:', response)
    return false
  }
  
  if (response.jsonData && !response.jsonData.type) {
    console.error('Invalid JSON data structure:', response.jsonData)
    return false
  }
  
  return true
}
```

---

> **Lưu ý**: Đảm bảo server đang chạy và database connection hoạt động trước khi test các examples này.
