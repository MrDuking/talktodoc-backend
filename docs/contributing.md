# Contributing Guide

## Quy trình đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'feat: add some amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## Quy ước commit message

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Thêm tính năng mới
- `fix:` Sửa lỗi
- `docs:` Thay đổi documentation
- `style:` Thay đổi format code (không ảnh hưởng code)
- `refactor:` Refactor code
- `test:` Thêm/sửa tests
- `chore:` Thay đổi build process, tools, etc.

## Code Style

1. **TypeScript**

   - Sử dụng strict mode
   - Định nghĩa type cho tất cả biến
   - Sử dụng interface thay vì type khi có thể
   - Tránh sử dụng `any`

2. **NestJS**

   - Tuân thủ module pattern
   - Sử dụng dependency injection
   - Tách biệt business logic vào services
   - Sử dụng DTOs cho validation

3. **Testing**
   - Unit test cho services
   - Integration test cho controllers
   - E2E test cho API endpoints
   - Test coverage > 80%

## Pull Request Process

1. Cập nhật README.md nếu cần
2. Thêm tests cho tính năng mới
3. Đảm bảo tất cả tests pass
4. Cập nhật documentation
5. Tạo PR với mô tả chi tiết

## Development Setup

1. Cài đặt dependencies:

   ```bash
   npm install
   ```

2. Cài đặt pre-commit hooks:

   ```bash
   npm run prepare
   ```

3. Chạy development server:

   ```bash
   npm run start:dev
   ```

4. Chạy tests:
   ```bash
   npm run test
   ```

## Code Review Guidelines

1. **Kiểm tra code style**

   - Tuân thủ ESLint rules
   - Format code với Prettier
   - Không có lỗi TypeScript

2. **Kiểm tra functionality**

   - Code hoạt động đúng
   - Xử lý edge cases
   - Performance tốt

3. **Kiểm tra security**

   - Không có security vulnerabilities
   - Xử lý input validation
   - Xử lý authentication/authorization

4. **Kiểm tra tests**
   - Tests đầy đủ
   - Tests pass
   - Test coverage đạt yêu cầu
