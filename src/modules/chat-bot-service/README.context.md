# Chat Bot Service Context API - Hướng dẫn cho Frontend

## Tổng quan

Dịch vụ chat bot hỗ trợ gửi tin nhắn dạng text và hình ảnh (qua URL). API backend sẽ tự động nhận diện, phân tích và trả lời phù hợp.

---

## 1. Endpoint API gửi tin nhắn

### **Endpoint chung**

- **Method:** `POST`
- **Path:** `/chat-bot-service/:conversationId/send-message`
  - `:conversationId` là ID của cuộc hội thoại (lấy từ API tạo mới hoặc danh sách hội thoại).
- **Content-Type:** `application/json`

---

## 2. Gửi tin nhắn (text + ảnh)

### **Phương án 1: Gửi ảnh qua URL trong chuỗi message**

- **Text**: Gửi như bình thường.
- **Ảnh**: Gửi dưới dạng URL ảnh hợp lệ (jpg, png, webp, ...), chèn trực tiếp vào chuỗi `message` (có thể nhiều URL, cách nhau bởi dấu cách hoặc xuống dòng).
- **Ưu điểm**: Đơn giản, không cần đổi API, tương thích mọi client.
- **Nhược điểm**: Frontend phải tự nối URL ảnh vào chuỗi text.

#### Ví dụ message hợp lệ

```
Tôi bị nổi mẩn đỏ, đây là ảnh:
https://example.com/image1.jpg https://example.com/image2.png
```

#### Request mẫu

```json
{
  "message": "Tôi bị đau bụng nhiều ngày\nhttps://example.com/image.jpg",
  "user_id": "user_123"
}
```

#### Ví dụ curl:

```bash
curl -X POST 'http://localhost:3000/chat-bot-service/6824d208e2f12cad7d54c0c6/send-message' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "message": "Tôi bị đau bụng nhiều ngày\nhttps://example.com/image.jpg",
    "user_id": "user_123"
  }'
```

---

### **Phương án 2: Gửi ảnh qua trường imageUrls (mảng URL)**

- **Text**: Gửi trong trường `message`.
- **Ảnh**: Gửi mảng URL ảnh trong trường `imageUrls` (kiểu: string[]).
- **Ưu điểm**: Frontend dễ tách biệt text và ảnh, backend xử lý rõ ràng.
- **Nhược điểm**: Cần cập nhật API, controller, DTO, tài liệu.

#### Request mẫu

```json
{
  "message": "Tôi bị đau bụng nhiều ngày",
  "user_id": "user_123",
  "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.png"]
}
```

#### Ví dụ curl:

```bash
curl -X POST 'http://localhost:3000/chat-bot-service/6824d208e2f12cad7d54c0c6/send-message' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "message": "Tôi bị đau bụng nhiều ngày",
    "user_id": "user_123",
    "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.png"]
  }'
```

#### Lưu ý:

- Nếu gửi cả URL ảnh trong `message` và trong `imageUrls`, backend sẽ gộp lại và phân tích tất cả.
- Nếu chỉ gửi `message` (không có `imageUrls`), backend vẫn hoạt động bình thường.

---

## 3. Response mẫu

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

## 4. Hướng dẫn frontend tweak logic

- **Khuyến nghị:**
  - Nếu backend đã hỗ trợ trường `imageUrls`, frontend nên tách riêng text và mảng URL ảnh, gửi đúng 2 trường này.
  - Nếu backend chỉ hỗ trợ `message`, hãy nối các URL ảnh vào chuỗi text, cách nhau bằng dấu cách hoặc xuống dòng.
- **Khi upload file ảnh:**
  1. Upload file lên dịch vụ lưu trữ (Cloudinary, Imgur, S3, ...).
  2. Lấy URL trả về, đưa vào mảng `imageUrls` (nếu dùng phương án 2) hoặc nối vào chuỗi `message` (nếu dùng phương án 1).
- **Luôn đảm bảo URL ảnh là public và hợp lệ.**

---

## 5. Lưu ý khi tích hợp

- Có thể gửi nhiều ảnh cùng lúc, AI sẽ phân tích tổng thể.
- Nếu chỉ có text, AI sẽ trả lời như bình thường.
- Nếu chỉ có ảnh, AI sẽ phân tích ảnh.
- Nếu gửi cả text và ảnh, AI sẽ phân tích tổng thể.
- Đảm bảo URL ảnh truy cập được từ internet (không dùng local file).

---

## 6. Xử lý lỗi

- Nếu ảnh không hợp lệ hoặc không truy cập được, AI sẽ trả về thông báo lỗi thân thiện.
- Nếu API OpenAI Vision lỗi, backend sẽ trả về thông báo lỗi cho người dùng.

---

Nếu cần hỗ trợ thêm về upload file ảnh hoặc các format khác, liên hệ backend để mở rộng API.
