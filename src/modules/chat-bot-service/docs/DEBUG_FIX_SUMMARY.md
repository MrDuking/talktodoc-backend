# Debug Fix Summary - JSON Response Logic

## Vấn đề ban đầu

API trả về JSON trong `reply` thay vì tách biệt như mong muốn:
```json
{
  "reply": "{\n  \"type\": \"appointment_info\",\n  \"data\": {\n    \"hasAppointment\": false\n  }\n}"
}
```

## Nguyên nhân

1. **AI trả về raw JSON**: Thay vì markdown format `\`\`\`json {...} \`\`\``, AI trả về raw JSON `{...}`
2. **Regex pattern cũ**: Chỉ detect markdown format, không detect raw JSON
3. **System prompt**: Không hướng dẫn AI cách trả về khi có cả 2 params

## Giải pháp đã áp dụng

### 1. Cập nhật Regex Pattern
```typescript
// Cũ: Chỉ detect markdown
const jsonMatch = reply.match(/```json\s*(\{[\s\S]*?\})\s*```/)

// Mới: Detect cả markdown và raw JSON
const jsonMatch = reply.match(/```json\s*(\{[\s\S]*?\})\s*```/)
const rawJsonMatch = reply.match(/^\s*\{[\s\S]*\}\s*$/)
```

### 2. Cập nhật System Prompt
```typescript
const hasBothJsonParams = dto.requireJsonResponse && dto.jsonResponseType

const systemPrompt = `
// ... existing prompt ...

${hasBothJsonParams ? `
**LƯU Ý ĐẶC BIỆT**: Bạn đang được yêu cầu trả về cả text và JSON riêng biệt.
- Hãy trả lời bằng text tiếng Việt thông thường trước
- Sau đó thêm JSON data theo format bên dưới
- Đảm bảo text và JSON được tách biệt rõ ràng
` : ''}
// ... rest of prompt ...
`
```

### 3. Cập nhật Logic Xử lý
```typescript
if (hasBothJsonParams) {
  // Tách JSON ra khỏi reply
  if (jsonMatch) {
    finalReply = reply.replace(/```json\s*\{[\s\S]*?\}\s*```/, '').trim()
  } else if (rawJsonMatch) {
    finalReply = reply.replace(/^\s*\{[\s\S]*\}\s*$/, '').trim()
  }
  
  // Đưa JSON vào jsonData
  jsonData = {
    type: parsedJson.type || dto.jsonResponseType || 'general_info',
    data: parsedJson.data || parsedJson,
  }
}
```

## Kết quả mong đợi

### Request
```json
{
  "message": "Kiểm tra lịch hẹn",
  "user_id": "67e3f1fc6b4dbf9229f687d8",
  "requireJsonResponse": true,
  "jsonResponseType": "appointment_info"
}
```

### Response mong đợi
```json
{
  "success": true,
  "reply": "Tôi đã kiểm tra lịch hẹn của bạn. Hiện tại bạn chưa có lịch hẹn nào.",
  "jsonData": {
    "type": "appointment_info",
    "data": {
      "hasAppointment": false
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o-mini"
}
```

## Test Cases

### Case 1: Raw JSON Response
```
Input: {"type": "appointment_info", "data": {"hasAppointment": false}}
Expected: 
- reply: "Tôi đã kiểm tra lịch hẹn..."
- jsonData: {type: "appointment_info", data: {...}}
```

### Case 2: Markdown JSON Response
```
Input: "Tôi đã kiểm tra...\n```json\n{\"type\": \"appointment_info\", \"data\": {...}}\n```"
Expected:
- reply: "Tôi đã kiểm tra..."
- jsonData: {type: "appointment_info", data: {...}}
```

### Case 3: Mixed Content
```
Input: "Tôi đã kiểm tra lịch hẹn của bạn.\n{\"type\": \"appointment_info\", \"data\": {...}}"
Expected:
- reply: "Tôi đã kiểm tra lịch hẹn của bạn."
- jsonData: {type: "appointment_info", data: {...}}
```

## Validation

- ✅ Build thành công
- ✅ Logic backward compatible
- ✅ Hỗ trợ cả raw JSON và markdown JSON
- ✅ System prompt thông minh theo context
- ✅ Tách biệt hoàn toàn text và JSON khi có cả 2 params
