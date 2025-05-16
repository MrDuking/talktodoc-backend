# 📚 Chat Bot Service API Documentation

## 1. Tổng quan

Dịch vụ Chat Bot hỗ trợ hội thoại giữa người dùng và AI, nhận diện và trả lời thông minh dựa trên text và hình ảnh (qua URL).
API hỗ trợ gửi tin nhắn, nhận phản hồi, lưu lịch sử hội thoại.

---

## 2. Endpoint gửi tin nhắn

- **Method:** `POST`
- **Path:** `/chat-bot-service/:conversationId/send-message`
  - `:conversationId`: ID của cuộc hội thoại (tạo mới hoặc lấy từ danh sách hội thoại).
- **Content-Type:** `application/json`

---

## 3. Cách gửi tin nhắn

### 3.1. Gửi text + ảnh qua URL trong message

- Gửi text như bình thường.
- Gửi ảnh bằng cách chèn URL ảnh vào chuỗi `message` (cách nhau bởi dấu cách hoặc xuống dòng).

**Ví dụ:**

```json
{
  "message": "Tôi bị nổi mẩn đỏ, đây là ảnh:\nhttps://example.com/image1.jpg https://example.com/image2.png",
  "user_id": "user_123"
}
```

### 3.2. Gửi text + ảnh qua trường `imageUrls` (Khuyến nghị)

- Gửi text trong trường `message`.
- Gửi mảng URL ảnh trong trường `imageUrls`.

**Ví dụ:**

```json
{
  "message": "Tôi bị đau bụng nhiều ngày",
  "user_id": "user_123",
  "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.png"]
}
```

**Lưu ý:** Có thể gửi đồng thời cả URL ảnh trong `message` và trong `imageUrls`, backend sẽ gộp lại để phân tích.

---

## 4. Response mẫu

```json
{
  "reply": "AI trả lời phân tích cả text và ảnh...",
  "messages": [
    { "role": "user", "content": "Tôi bị đau bụng nhiều ngày https://example.com/image1.jpg" },
    { "role": "assistant", "content": "AI trả lời phân tích cả text và ảnh..." }
  ]
}
```

- `reply`: Câu trả lời cuối cùng của AI.
- `messages`: Lịch sử hội thoại (bao gồm cả user và assistant).

---

## 5. Hướng dẫn frontend

- **Khuyến nghị:** Nếu backend đã hỗ trợ `imageUrls`, hãy tách riêng text và mảng URL ảnh, gửi đúng 2 trường này.
- Khi upload ảnh:
  1. Upload lên dịch vụ lưu trữ (Cloudinary, S3, ...).
  2. Lấy URL trả về, đưa vào `imageUrls` hoặc nối vào `message` (nếu chỉ hỗ trợ message).
- Đảm bảo URL ảnh là public.

---

## 6. Lưu ý

- Có thể gửi nhiều ảnh cùng lúc, AI sẽ phân tích tổng thể.
- Nếu chỉ có text, AI trả lời như bình thường.
- Nếu chỉ có ảnh, AI sẽ phân tích ảnh.
- Nếu gửi cả text và ảnh, AI sẽ phân tích tổng thể.
- Đảm bảo URL ảnh truy cập được từ internet.

---

## 7. Xử lý lỗi

- Nếu ảnh không hợp lệ hoặc không truy cập được, AI sẽ trả về thông báo lỗi thân thiện.
- Nếu API AI lỗi, backend sẽ trả về thông báo lỗi cho người dùng.

---

## 8. Ví dụ curl

```bash
curl -X POST 'http://localhost:3000/chat-bot-service/6824d208e2f12cad7d54c0c6/send-message' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "message": "Tôi bị đau bụng nhiều ngày",
    "user_id": "user_123",
    "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.png"]
  }'
```

---

**Nếu cần hỗ trợ thêm về upload file ảnh hoặc các format khác, liên hệ backend để mở rộng API.**
