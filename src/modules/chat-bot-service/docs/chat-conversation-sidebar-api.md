# 🔧 Backend API Implementation Guide - Chat Conversation Sidebar

## 📋 Tổng quan

Tài liệu này hướng dẫn Backend Developer implement các API endpoints cần thiết cho Chat Conversation Sidebar feature. Frontend đã hoàn thành và đang chờ Backend cung cấp các API endpoints theo chuẩn RESTful.

---

## 🎯 Mục tiêu

- Cung cấp API endpoints để Frontend fetch danh sách conversations
- Hỗ trợ search/filter conversations
- Quản lý trạng thái đọc/chưa đọc
- Tạo mới và xóa conversations
- Đảm bảo data consistency và performance

---

## 📊 Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  type ENUM('ai', 'doctor') NOT NULL DEFAULT 'ai',
  model_used VARCHAR(100),
  last_message TEXT,
  last_message_at TIMESTAMP,
  unread_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_updated_at (updated_at),
  INDEX idx_type (type)
);
```

### Messages Table (nếu chưa có)
```sql
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  role ENUM('user', 'assistant', 'doctor') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

---

## 🚀 API Endpoints

### 1. GET /chat - Lấy danh sách conversations

**Request:**
```http
GET /chat?user_id=user_123&page=1&limit=20&type=ai&search=keyword
```

**Query Parameters:**
- `user_id` (required): ID của user
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items per page (default: 20, max: 100)
- `type` (optional): Filter by type ('ai' | 'doctor')
- `search` (optional): Search trong title và last_message

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_001",
      "title": "AI - gpt-4o-mini",
      "lastMessage": "Bạn nhớ uống nhiều nước nhé...",
      "updatedAt": "2024-01-20T18:00:00Z",
      "unread": true,
      "model_used": "gpt-4o-mini",
      "type": "ai",
      "avatar": "https://example.com/ai-avatar.png",
      "participantCount": 1
    },
    {
      "id": "conv_002",
      "title": "Bác sĩ Lan",
      "lastMessage": "Lần sau khám lại sau 1 tháng.",
      "updatedAt": "2024-01-19T11:02:00Z",
      "unread": false,
      "model_used": "doctor",
      "type": "doctor",
      "avatar": "https://example.com/doctor-avatar.jpg",
      "participantCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Implementation Notes:**
- Sort by `updated_at DESC`
- Include unread count logic
- Support pagination
- Optimize with proper indexing

---

### 2. GET /chat/:conversationId - Lấy chi tiết conversation

**Request:**
```http
GET /chat/conv_001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv_001",
      "user_id": "user_123",
      "title": "AI - gpt-4o-mini",
      "type": "ai",
      "model_used": "gpt-4o-mini",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-20T18:00:00Z"
    },
    "messages": [
      {
        "id": "msg_001",
        "role": "user",
        "content": "Tôi bị đau đầu nhiều ngày",
        "created_at": "2024-01-20T18:00:00Z"
      },
      {
        "id": "msg_002",
        "role": "assistant",
        "content": "Bạn nhớ uống nhiều nước nhé...",
        "created_at": "2024-01-20T18:01:00Z"
      }
    ]
  }
}
```

---

### 3. PATCH /chat/:conversationId/read - Đánh dấu đã đọc

**Request:**
```http
PATCH /chat/conv_001/read
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation marked as read"
}
```

**Implementation Notes:**
- Reset `unread_count` to 0
- Update `updated_at` timestamp
- Return success response

---

### 4. POST /chat - Tạo conversation mới

**Request:**
```http
POST /chat
Content-Type: application/json

{
  "user_id": "user_123",
  "model_used": "gpt-4o-mini",
  "type": "ai",
  "title": "AI - gpt-4o-mini"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_new_001",
    "user_id": "user_123",
    "title": "AI - gpt-4o-mini",
    "type": "ai",
    "model_used": "gpt-4o-mini",
    "unread_count": 0,
    "created_at": "2024-01-20T19:00:00Z",
    "updated_at": "2024-01-20T19:00:00Z"
  }
}
```

---

### 5. DELETE /chat/:conversationId - Xóa conversation

**Request:**
```http
DELETE /chat/conv_001
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

**Implementation Notes:**
- Soft delete hoặc hard delete tùy business logic
- Cascade delete messages nếu hard delete
- Return appropriate response

---

### 6. GET /chat/search - Tìm kiếm conversations

**Request:**
```http
GET /chat/search?user_id=user_123&q=keyword&type=ai
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_001",
      "title": "AI - gpt-4o-mini",
      "lastMessage": "Bạn nhớ uống nhiều nước nhé...",
      "updatedAt": "2024-01-20T18:00:00Z",
      "unread": true,
      "model_used": "gpt-4o-mini",
      "type": "ai"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 🔄 Business Logic

### 1. Unread Count Management

```javascript
// Khi có message mới
async function addMessage(conversationId, message) {
  // Thêm message vào database
  await db.messages.create(message);
  
  // Cập nhật last_message và unread_count
  await db.conversations.update(conversationId, {
    last_message: message.content,
    last_message_at: new Date(),
    unread_count: db.raw('unread_count + 1'),
    updated_at: new Date()
  });
}

// Khi user đọc conversation
async function markAsRead(conversationId) {
  await db.conversations.update(conversationId, {
    unread_count: 0,
    updated_at: new Date()
  });
}
```

### 2. Title Generation

```javascript
// Tự động generate title dựa trên type và model
function generateTitle(type, modelUsed, doctorName = null) {
  if (type === 'doctor' && doctorName) {
    return `Bác sĩ ${doctorName}`;
  }
  
  if (type === 'ai') {
    const modelLabels = {
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo'
    };
    return `AI - ${modelLabels[modelUsed] || modelUsed}`;
  }
  
  return 'Cuộc trò chuyện mới';
}
```

### 3. Data Validation

```javascript
// Validation schema
const conversationSchema = {
  user_id: { required: true, type: 'string' },
  type: { required: true, enum: ['ai', 'doctor'] },
  model_used: { required: false, type: 'string' },
  title: { required: false, type: 'string', maxLength: 500 }
};

// Validation middleware
function validateConversation(req, res, next) {
  const { error } = conversationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details
    });
  }
  next();
}
```

---

## 🚨 Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "error details"
  }
}
```

### Common Error Codes

- `CONVERSATION_NOT_FOUND`: Conversation không tồn tại
- `UNAUTHORIZED`: Không có quyền truy cập
- `VALIDATION_ERROR`: Dữ liệu không hợp lệ
- `RATE_LIMIT_EXCEEDED`: Vượt quá giới hạn request
- `INTERNAL_SERVER_ERROR`: Lỗi server

---

## 🔒 Security & Authentication

### 1. Authentication Middleware

```javascript
// Verify JWT token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
}
```

### 2. Authorization Check

```javascript
// Kiểm tra user có quyền truy cập conversation
async function checkConversationAccess(req, res, next) {
  const { conversationId } = req.params;
  const userId = req.user.id;
  
  const conversation = await db.conversations.findOne({
    where: { id: conversationId, user_id: userId }
  });
  
  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }
  
  req.conversation = conversation;
  next();
}
```

---

## 📈 Performance Optimization

### 1. Database Indexing

```sql
-- Indexes for optimal performance
CREATE INDEX idx_conversations_user_updated ON conversations(user_id, updated_at DESC);
CREATE INDEX idx_conversations_user_type ON conversations(user_id, type);
CREATE INDEX idx_conversations_search ON conversations(user_id, title, last_message);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
```

### 2. Caching Strategy

```javascript
// Redis caching for frequently accessed data
const redis = require('redis');
const client = redis.createClient();

// Cache conversation list
async function getConversationsWithCache(userId, page = 1, limit = 20) {
  const cacheKey = `conversations:${userId}:${page}:${limit}`;
  
  // Try cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const conversations = await db.conversations.findMany({
    where: { user_id: userId },
    orderBy: { updated_at: 'desc' },
    skip: (page - 1) * limit,
    take: limit
  });
  
  // Cache for 5 minutes
  await client.setex(cacheKey, 300, JSON.stringify(conversations));
  
  return conversations;
}
```

### 3. Pagination

```javascript
// Efficient pagination with cursor-based approach
async function getConversationsPaginated(userId, cursor = null, limit = 20) {
  const where = { user_id: userId };
  
  if (cursor) {
    where.updated_at = { lt: new Date(cursor) };
  }
  
  const conversations = await db.conversations.findMany({
    where,
    orderBy: { updated_at: 'desc' },
    take: limit + 1 // Take one extra to check if there are more
  });
  
  const hasMore = conversations.length > limit;
  if (hasMore) {
    conversations.pop(); // Remove the extra item
  }
  
  const nextCursor = hasMore ? conversations[conversations.length - 1].updated_at : null;
  
  return {
    data: conversations,
    hasMore,
    nextCursor
  };
}
```

---

## 🧪 Testing

### 1. Unit Tests

```javascript
// Example test cases
describe('Conversation API', () => {
  test('GET /chat should return user conversations', async () => {
    const response = await request(app)
      .get('/chat?user_id=user_123')
      .set('Authorization', 'Bearer valid_token');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  test('PATCH /chat/:id/read should mark as read', async () => {
    const response = await request(app)
      .patch('/chat/conv_001/read')
      .set('Authorization', 'Bearer valid_token');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### 2. Integration Tests

```javascript
// Test full conversation flow
describe('Conversation Flow', () => {
  test('Create conversation -> Add message -> Mark as read', async () => {
    // Create conversation
    const createResponse = await request(app)
      .post('/chat')
      .send({ user_id: 'user_123', type: 'ai' });
    
    const conversationId = createResponse.body.data.id;
    
    // Add message
    await request(app)
      .post(`/chat/${conversationId}`)
      .send({ message: 'Hello', user_id: 'user_123' });
    
    // Mark as read
    await request(app)
      .patch(`/chat/${conversationId}/read`);
    
    // Verify unread count is 0
    const getResponse = await request(app)
      .get(`/chat/${conversationId}`);
    
    expect(getResponse.body.data.conversation.unread_count).toBe(0);
  });
});
```

---

## 📋 TODO List cho Backend Developer

### Phase 1: Core APIs (Priority: High) ✅ COMPLETED
- [x] **Database Schema**: Cập nhật ChatConversation schema với title, type, last_message, unread_count
- [x] **GET /chat**: Implemented lấy danh sách conversations với pagination
- [x] **GET /chat/:id**: Đã có sẵn (getConversationById)
- [x] **PATCH /chat/:id/read**: Implemented đánh dấu đã đọc
- [ ] **Authentication**: Implement JWT middleware (cần thêm)
- [ ] **Authorization**: Implement user access control (cần thêm)

### Phase 2: Enhanced Features (Priority: Medium) ✅ COMPLETED
- [x] **POST /chat**: Đã có sẵn (createConversation) - đã cập nhật
- [x] **DELETE /chat/:id**: Implemented xóa conversation
- [x] **GET /chat/search**: Implemented search trong GET /chat endpoint
- [x] **Unread Count Logic**: Implemented logic đếm tin nhắn chưa đọc
- [x] **Title Generation**: Implemented tự động tạo title

### Phase 3: Performance & Security (Priority: Medium)
- [ ] **Database Indexing**: Tạo indexes cho performance
- [ ] **Caching**: Implement Redis caching
- [ ] **Rate Limiting**: Implement rate limiting
- [ ] **Input Validation**: Implement validation middleware
- [ ] **Error Handling**: Implement standardized error responses

### Phase 4: Advanced Features (Priority: Low)
- [ ] **Real-time Updates**: Implement WebSocket cho real-time
- [ ] **Analytics**: Implement conversation analytics
- [ ] **Export/Import**: Implement export conversations
- [ ] **Bulk Operations**: Implement bulk delete/update
- [ ] **Audit Log**: Implement audit trail

### Phase 5: Testing & Documentation (Priority: High)
- [ ] **Unit Tests**: Viết unit tests cho tất cả endpoints
- [ ] **Integration Tests**: Viết integration tests
- [ ] **API Documentation**: Tạo Swagger/OpenAPI docs
- [ ] **Performance Tests**: Test performance với large dataset
- [ ] **Security Tests**: Test security vulnerabilities

---

## 🔗 Integration với Frontend

### Environment Variables
```env
# Backend cần cung cấp
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

### CORS Configuration
```javascript
// Cấu hình CORS cho Frontend
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

### Response Headers
```javascript
// Thêm headers cần thiết
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  next();
});
```

---

## ✅ Implementation Status

### Đã Hoàn Thành (Completed)

1. **Database Schema Updates**
   - Cập nhật `ChatConversation` schema với các fields mới: `title`, `type`, `last_message`, `unread_count`
   - Tự động tạo timestamps với `createdAt` và `updatedAt`

2. **API Endpoints**
   - `GET /chat` - Lấy danh sách conversations với pagination và search
   - `PATCH /chat/:id/read` - Đánh dấu conversation đã đọc  
   - `DELETE /chat/:id` - Xóa conversation
   - `PATCH /chat/:id` - Cập nhật thông tin conversation
   - `POST /chat` - Tạo conversation mới (đã có, được cập nhật)
   - `GET /chat/:id` - Lấy chi tiết conversation (đã có)

3. **Business Logic**
   - Auto-generate title dựa trên type và model
   - Unread count management (tự động tăng khi có message mới)
   - Search functionality trong title và last_message
   - Avatar URL generation

4. **DTOs & Validation**
   - `GetConversationsDto` - Query parameters validation
   - `UpdateConversationDto` - Update request validation
   - `ConversationResponseDto` - Response format chuẩn hóa

### Cần Bổ Sung (To Do)

1. **Authentication & Authorization**
   - JWT middleware cho API protection
   - User access control validation

2. **Performance Optimization**
   - Database indexing
   - Redis caching
   - Rate limiting

3. **Testing**
   - Unit tests cho các endpoints
   - Integration tests

---

## 📞 Support & Contact

- **Frontend Developer**: Có thể bắt đầu integrate với các API endpoints đã implement
- **Backend Developer**: Đã implement xong core functionality theo spec
- **Testing**: Có thể test với Swagger UI tại `/api/docs`

---

## 🚀 Cách Test API

1. **Start Backend Server**
   ```bash
   npm run start:dev
   ```

2. **Access Swagger Documentation**
   ```
   http://localhost:3000/api/docs
   ```

3. **Test Endpoints**
   - GET `/chat?user_id=test&page=1&limit=10`
   - POST `/chat` với body: `{"user_id": "test", "model_used": "gpt-4o"}`
   - PATCH `/chat/{id}/read`
   - DELETE `/chat/{id}`

---

> **Lưu ý**: API đã được implement theo đúng spec trong tài liệu. Frontend có thể bắt đầu integrate ngay lập tức.
