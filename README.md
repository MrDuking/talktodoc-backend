# TalkToDoc Server

Backend server cho ứng dụng TalkToDoc - Hệ thống hỗ trợ tìm kiếm và trả lời câu hỏi từ tài liệu.

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy ở môi trường development
npm run start:dev

# Build project
npm run build

# Chạy ở môi trường production
npm run start:prod
```

## Cấu trúc dự án

```
src/
├── auth/                 # Module xác thực
├── users/               # Module quản lý người dùng
├── documents/           # Module quản lý tài liệu
├── chat/                # Module xử lý chat
├── common/              # Shared utilities và constants
├── config/              # Cấu hình ứng dụng
└── main.ts             # Entry point
```

## API Documentation

Xem chi tiết API tại [API Documentation](./docs/api.md)

## Quy trình phát triển

1. **Tạo branch mới**

   ```bash
   git checkout -b feature/ten-feature
   ```

2. **Commit changes**

   ```bash
   git add .
   git commit -m "feat: mô tả thay đổi"
   ```

3. **Push và tạo Pull Request**
   ```bash
   git push origin feature/ten-feature
   ```

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## CI/CD

Dự án sử dụng GitHub Actions để tự động hóa quy trình:

- Kiểm tra code style
- Chạy unit tests
- Build và deploy

Xem chi tiết tại [CI/CD Documentation](./docs/ci-cd.md)

## Contributing

Xem hướng dẫn đóng góp tại [Contributing Guide](./docs/contributing.md)

## License

MIT
