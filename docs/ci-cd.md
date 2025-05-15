# CI/CD Documentation

## GitHub Actions Workflows

### 1. Code Quality Check

Workflow này chạy khi có pull request hoặc push vào main branch:

```yaml
name: Code Quality Check

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
```

### 2. Build and Deploy

Workflow này chạy khi code được merge vào main branch:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
```

## Quy trình tự động hóa

1. **Code Quality**
   - ESLint kiểm tra code style
   - Prettier format code
   - Jest chạy unit tests
   - SonarQube phân tích code quality

2. **Build**
   - Build TypeScript code
   - Tạo Docker image
   - Push image lên Docker Hub

3. **Deploy**
   - Deploy lên staging environment
   - Chạy integration tests
   - Deploy lên production nếu tests pass

## Environment Variables

Các biến môi trường cần thiết:

```env
# Database
DATABASE_URL=

# JWT
JWT_SECRET=
JWT_EXPIRATION=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

# OpenAI
OPENAI_API_KEY=
```

## Monitoring

- Sử dụng Sentry để theo dõi lỗi
- Prometheus + Grafana để monitoring metrics
- ELK Stack để log management 