# 📚 Chat Bot Service API Documentation

## 1. Tổng quan

Dịch vụ Chat Bot hỗ trợ hội thoại giữa người dùng và AI, nhận diện và trả lời thông minh dựa trên text và hình ảnh (qua URL). API hỗ trợ:

- Tạo cuộc hội thoại và chọn model AI ngay từ frontend
- Gửi tin nhắn (text/ảnh) và có thể đổi model ngay khi đang chat
- Đổi model cho một cuộc hội thoại qua endpoint riêng

---

## 2. Endpoint

- Tạo cuộc hội thoại: `POST /chat`
- Lấy chi tiết cuộc hội thoại: `GET /chat/:conversationId`
- Gửi tin nhắn: `POST /chat/:conversationId`
- Đổi model: `PATCH /chat/:conversationId/model`

Tất cả sử dụng `Content-Type: application/json`.

---

## 3. Tạo cuộc hội thoại (chọn model từ frontend)

### Request
```json
{
  "user_id": "user_123",
  "model_used": "gpt-4o-mini", // Optional - nếu thiếu sẽ dùng mặc định "gpt-3.5-turbo"
  "context": { "locale": "vi-VN" } // Optional
}
```

### Response (rút gọn)
```json
{
  "_id": "<conversationId>",
  "user_id": "user_123",
  "model_used": "gpt-4o-mini",
  "messages": [],
  "context": { "locale": "vi-VN" }
}
```

---

## 4. Gửi tin nhắn (có thể đổi model ngay trong request)

### 4.1. Gửi text + ảnh qua URL trong message

- Gửi ảnh bằng cách chèn URL ảnh vào chuỗi `message`.

Ví dụ:
```json
{
  "message": "Tôi bị nổi mẩn đỏ, đây là ảnh:\nhttps://example.com/image1.jpg https://example.com/image2.png",
  "user_id": "user_123",
  "model": "gpt-4o" // Optional - nếu truyền sẽ đổi model của cuộc hội thoại trước khi trả lời
}
```

### 4.2. Gửi text + ảnh qua trường `imageUrls` (Khuyến nghị)

```json
{
  "message": "Tôi bị đau bụng nhiều ngày",
  "user_id": "user_123",
  "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.png"],
  "model": "gpt-4o-mini" // Optional
}
```

Lưu ý:
- Có thể gửi đồng thời URL ảnh trong `message` và trong `imageUrls`, backend sẽ gộp lại.
- Trường `message` có thể để trống nếu chỉ gửi ảnh.
- Nếu request có ảnh và không chỉ định `model`, backend sẽ dùng model vision mặc định `gpt-4o`.

### 4.3. Response mẫu
```json
{
  "reply": "AI trả lời phân tích cả text và ảnh...",
  "messages": [
    { "role": "user", "content": "Tôi bị đau bụng nhiều ngày https://example.com/image1.jpg" },
    { "role": "assistant", "content": "AI trả lời phân tích cả text và ảnh..." }
  ]
}
```

---

## 5. Đổi model cho cuộc hội thoại (endpoint riêng)

### Request
`PATCH /chat/:conversationId/model`
```json
{ "model": "gpt-3.5-turbo" }
```

### Response (rút gọn)
```json
{
  "_id": "<conversationId>",
  "model_used": "gpt-3.5-turbo"
}
```

---

## 6. Hướng dẫn frontend

- Khi tạo hội thoại, truyền `model_used` nếu muốn chọn model ngay từ đầu.
- Trong khi chat, có 2 cách đổi model:
  - Truyền `model` trong body của `POST /chat/:conversationId`
  - Hoặc gọi `PATCH /chat/:conversationId/model` để đổi trước, rồi gửi tin nhắn
- Với ảnh: nếu không truyền `model`, backend mặc định dùng `gpt-4o` (vision-capable).
- Hãy đảm bảo URL ảnh là public.

---

## 7. Lưu ý

- Có thể gửi nhiều ảnh cùng lúc, AI sẽ phân tích tổng thể.
- Nếu chỉ có text, AI trả lời như bình thường với `model_used` hiện tại.
- Nếu chỉ có ảnh, AI sẽ phân tích ảnh (ưu tiên model vision).
- Đảm bảo URL ảnh truy cập được từ internet.

---

## 8. Xử lý lỗi

- Ảnh không hợp lệ/không truy cập được: trả về thông báo lỗi thân thiện.
- API AI lỗi: trả về thông báo lỗi cho người dùng.

---

## 9. Ví dụ curl

Tạo hội thoại với model:
```bash
curl -X POST 'http://localhost:3000/chat' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "user_id": "user_123",
    "model_used": "gpt-4o-mini",
    "context": {"locale": "vi-VN"}
  }'
```

Gửi tin nhắn và đổi model ngay trong request:
```bash
curl -X POST 'http://localhost:3000/chat/<conversationId>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "message": "Tôi bị đau bụng nhiều ngày",
    "user_id": "user_123",
    "model": "gpt-4o-mini"
  }'
```

Đổi model qua endpoint riêng:
```bash
curl -X PATCH 'http://localhost:3000/chat/<conversationId>/model' \
  -H 'Content-Type: application/json' \
  --data-raw '{"model": "gpt-3.5-turbo"}'
```

Gửi tin nhắn kèm ảnh (không chỉ định model → mặc định vision `gpt-4o`):
```bash
curl -X POST 'http://localhost:3000/chat/<conversationId>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "message": "Tôi bị đau bụng nhiều ngày",
    "user_id": "user_123",
    "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.png"]
  }'
```

---

**Nếu cần hỗ trợ thêm (upload ảnh, danh sách model hỗ trợ, giới hạn token...), vui lòng liên hệ backend để mở rộng API.**

