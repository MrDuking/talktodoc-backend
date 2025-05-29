# Chat Bot Service Module Documentation

Module tư vấn sức khỏe AI sử dụng OpenAI trong hệ thống TalkToDoc.

## Base URL

```
/chat
```

## Endpoints

### 1. Tạo cuộc trò chuyện mới

**POST** `/chat/conversation`

Tạo cuộc trò chuyện mới với AI bot.

#### Request Body

```json
{
  "user_id": "user_123"
}
```

#### Response Success

```json
{
  "statusCode": 201,
  "message": "Conversation created successfully",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "user_id": "user_123",
    "messages": [],
    "model_used": "gpt-3.5-turbo",
    "topic": null,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

### 2. Lấy thông tin cuộc trò chuyện

**GET** `/chat/conversation/:conversationId`

Lấy thông tin và lịch sử tin nhắn của cuộc trò chuyện.

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    "_id": "6405f7d2e4b0b7a7c8d9e0f1",
    "user_id": "user_123",
    "messages": [
      {
        "role": "user",
        "content": "Tôi bị đau bụng nhiều ngày",
        "imageUrls": []
      },
      {
        "role": "assistant",
        "content": "Tôi hiểu bạn đang gặp vấn đề về đau bụng. Để tư vấn chính xác hơn, bạn có thể mô tả thêm về:\n\n1. Đau bụng ở vị trí nào cụ thể?\n2. Đau kéo dài bao lâu?\n3. Có các triệu chứng kèm theo khác không (buồn nôn, tiêu chảy, sốt)?\n\nTuy nhiên, tôi khuyên bạn nên đặt lịch khám với bác sĩ chuyên khoa để được thăm khám trực tiếp và chẩn đoán chính xác.",
        "imageUrls": []
      }
    ],
    "model_used": "gpt-3.5-turbo",
    "topic": "Đau bụng",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:35:00.000Z"
  }
}
```

### 3. Gửi tin nhắn

**POST** `/chat/conversation/:conversationId/message`

Gửi tin nhắn cho AI bot và nhận phản hồi.

#### Request Body

```json
{
  "message": "Tôi bị đau bụng vùng rốn, đã 3 ngày rồi, có buồn nôn nhẹ",
  "user_id": "user_123",
  "imageUrls": ["https://example.com/medical-image1.jpg", "https://example.com/medical-image2.jpg"]
}
```

#### Response Success

```json
{
  "statusCode": 200,
  "message": "Message sent successfully",
  "success": true,
  "data": {
    "reply": "Dựa trên thông tin bạn cung cấp, đau bụng vùng rốn kéo dài 3 ngày cùng với buồn nôn có thể là dấu hiệu của một số tình trạng:\n\n**Có thể là:**\n- Viêm ruột thừa (nếu đau dịch chuyển sang phải)\n- Rối loạn tiêu hóa\n- Nhiễm trùng đường ruột\n\n**Khuyến nghị:**\n1. Theo dõi thêm các triệu chứng: sốt, đau tăng dần\n2. Ăn nhẹ, uống nhiều nước\n3. **QUAN TRỌNG**: Nếu đau tăng dần hoặc có sốt cao, hãy đến cơ sở y tế ngay\n\nBạn có muốn đặt lịch khám với bác sĩ tiêu hóa không?",
    "messages": [
      {
        "role": "user",
        "content": "Tôi bị đau bụng vùng rốn, đã 3 ngày rồi, có buồn nôn nhẹ",
        "imageUrls": [
          "https://example.com/medical-image1.jpg",
          "https://example.com/medical-image2.jpg"
        ]
      },
      {
        "role": "assistant",
        "content": "Dựa trên thông tin bạn cung cấp...",
        "imageUrls": []
      }
    ]
  }
}
```

#### Response với hình ảnh

```json
{
  "statusCode": 200,
  "message": "Message with images processed successfully",
  "success": true,
  "data": {
    "reply": "Tôi đã xem qua hình ảnh bạn gửi. Dựa trên mô tả triệu chứng và hình ảnh:\n\n**Nhận xét:**\n- Vùng đau có thể liên quan đến hệ tiêu hóa\n- Hình ảnh cho thấy có dấu hiệu viêm nhẹ\n\n**Khuyến nghị khẩn cấp:**\nBạn nên đến bệnh viện ngay để thăm khám vì:\n1. Đau kéo dài 3 ngày\n2. Có buồn nôn kèm theo\n3. Hình ảnh cho thấy cần kiểm tra thêm\n\nTôi có thể giúp bạn đặt lịch khám nhanh với bác sĩ tiêu hóa ngay bây giờ.",
    "messages": [...]
  }
}
```

## Schemas

### ChatConversation Schema

```typescript
{
  _id: ObjectId;
  user_id: string;              // ID người dùng
  messages: ChatMessage[];      // Lịch sử tin nhắn
  model_used?: string;          // Model AI sử dụng
  topic?: string;               // Chủ đề cuộc trò chuyện
  createdAt: Date;
  updatedAt: Date;
}
```

### ChatMessage Schema

```typescript
{
  role: 'user' | 'assistant';   // Vai trò người gửi
  content: string;              // Nội dung tin nhắn
  imageUrls?: string[];         // URLs hình ảnh (nếu có)
}
```

### CreateConversationDto

```typescript
{
  user_id: string // ID người dùng
}
```

### SendMessageDto

```typescript
{
  message?: string;             // Nội dung tin nhắn (optional nếu chỉ gửi ảnh)
  user_id: string;              // ID người gửi
  imageUrls?: string[];         // URLs hình ảnh kèm theo
}
```

## AI Features

### OpenAI Integration

- **Model**: GPT-3.5-turbo hoặc GPT-4
- **Context**: Giữ nguyên context của cuộc trò chuyện
- **Temperature**: 0.7 để cân bằng giữa sáng tạo và chính xác
- **Max tokens**: 1000 cho mỗi response

### Medical Knowledge Base

AI được training với kiến thức y tế cơ bản:

- Triệu chứng thông thường
- Lời khuyên sức khỏe tổng quát
- Khuyến nghị khám bác sĩ khi cần thiết
- **Lưu ý**: Không thay thế chẩn đoán y tế chuyên nghiệp

### Image Analysis

- **Hỗ trợ**: JPG, PNG formats
- **Kích thước**: Tối đa 10MB/ảnh
- **Số lượng**: Tối đa 5 ảnh/tin nhắn
- **Phân tích**: Mô tả hình ảnh y tế cơ bản
- **Bảo mật**: Hình ảnh được encrypt và tự động xóa sau 30 ngày

### Conversation Management

- **Session**: Mỗi user có thể có nhiều conversation
- **History**: Lưu trữ toàn bộ lịch sử tin nhắn
- **Topic Detection**: Tự động phát hiện chủ đề chính
- **Context Limit**: Giữ tối đa 20 tin nhắn gần nhất

## Business Logic

### Response Guidelines

AI tuân theo các nguyên tắc:

1. **An toàn**: Luôn khuyên đến bác sĩ cho các triệu chứng nghiêm trọng
2. **Chính xác**: Cung cấp thông tin y tế đáng tin cậy
3. **Thân thiện**: Ngôn ngữ dễ hiểu, đồng cảm
4. **Giới hạn**: Không chẩn đoán cụ thể hoặc kê đơn thuốc

### Emergency Detection

AI tự động phát hiện các dấu hiệu khẩn cấp:

- Đau ngực dữ dội
- Khó thở nặng
- Chảy máu nhiều
- Sốt cao kéo dài
- Triệu chứng đột quỵ

Khi phát hiện → Khuyến nghị đến cấp cứu ngay lập tức.

### Integration với Booking

Khi AI khuyên nên khám bác sĩ:

- Đề xuất chuyên khoa phù hợp
- Cung cấp link đặt lịch nhanh
- Gợi ý bác sĩ có rating cao

## Error Handling

| Status Code | Message                         | Mô tả                           |
| ----------- | ------------------------------- | ------------------------------- |
| 400         | Message content is required     | Thiếu nội dung tin nhắn         |
| 400         | Invalid image format            | Format ảnh không hỗ trợ         |
| 400         | Image size too large            | Ảnh quá dung lượng cho phép     |
| 404         | Conversation not found          | Không tìm thấy cuộc trò chuyện  |
| 429         | Rate limit exceeded             | Quá giới hạn số tin nhắn/phút   |
| 500         | OpenAI service error            | Lỗi dịch vụ OpenAI              |
| 503         | Service temporarily unavailable | Dịch vụ tạm thời không khả dụng |

## Rate Limiting

### User Limits

- **Tin nhắn**: 60 tin nhắn/giờ
- **Conversation**: 10 conversation mới/ngày
- **Images**: 20 ảnh/giờ
- **Token usage**: 10,000 tokens/ngày

### Premium Users

- **Tin nhắn**: 200 tin nhắn/giờ
- **Conversation**: Không giới hạn
- **Images**: 100 ảnh/giờ
- **Priority**: Ưu tiên response nhanh hơn

## Privacy & Security

### Data Protection

- **Encryption**: Tin nhắn được mã hóa AES-256
- **Retention**: Lịch sử chat lưu 6 tháng
- **Anonymization**: Loại bỏ thông tin cá nhân trước khi gửi OpenAI
- **GDPR**: Tuân thủ quy định bảo vệ dữ liệu

### Medical Privacy

- **No Storage**: Không lưu thông tin y tế nhạy cảm
- **Disclaimer**: Cảnh báo không thay thế tư vấn y tế
- **Audit Log**: Ghi log tất cả interaction để kiểm tra

## Examples

### Tạo conversation

```bash
curl -X POST http://localhost:3000/chat/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123"
  }'
```

### Gửi tin nhắn text

```bash
curl -X POST http://localhost:3000/chat/conversation/6405f7d2e4b0b7a7c8d9e0f1/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tôi bị đau đầu và sốt nhẹ",
    "user_id": "user_123"
  }'
```

### Gửi tin nhắn với hình ảnh

```bash
curl -X POST http://localhost:3000/chat/conversation/6405f7d2e4b0b7a7c8d9e0f1/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Đây là vết thương của tôi",
    "user_id": "user_123",
    "imageUrls": [
      "https://example.com/wound-image.jpg"
    ]
  }'
```

## Monitoring & Analytics

### Usage Metrics

- Số tin nhắn/ngày
- Thời gian response trung bình
- Tỷ lệ satisfaction
- Topics phổ biến
- Conversion rate đặt lịch

### Quality Assurance

- Human review sample conversations
- Feedback từ users
- Medical accuracy monitoring
- Continuous model improvement

## Future Enhancements

### Planned Features

- **Voice Messages**: Hỗ trợ tin nhắn voice
- **Video Analysis**: Phân tích video triệu chứng
- **Multi-language**: Hỗ trợ nhiều ngôn ngữ
- **Specialist Routing**: Tự động route đến bác sĩ phù hợp
- **Symptom Checker**: Tool kiểm tra triệu chứng tự động
