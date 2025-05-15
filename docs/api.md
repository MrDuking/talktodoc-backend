# API Documentation

## Authentication

### POST /auth/login
Đăng nhập vào hệ thống

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string"
}
```

### POST /auth/register
Đăng ký tài khoản mới

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "fullName": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "fullName": "string"
}
```

## Documents

### GET /documents
Lấy danh sách tài liệu

**Query Parameters:**
- page: number
- limit: number
- search: string

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

### POST /documents
Tải lên tài liệu mới

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "file": "File"
}
```

**Response:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "createdAt": "string"
}
```

## Chat

### POST /chat/message
Gửi tin nhắn chat

**Request Body:**
```json
{
  "message": "string",
  "documentId": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "message": "string",
  "response": "string",
  "createdAt": "string"
}
```

### GET /chat/history
Lấy lịch sử chat

**Query Parameters:**
- documentId: string
- page: number
- limit: number

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "message": "string",
      "response": "string",
      "createdAt": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
``` 