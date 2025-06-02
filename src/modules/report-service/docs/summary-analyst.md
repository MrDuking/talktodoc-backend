# API Report - Summary Analyst

## Endpoint

```
POST /report/summary-analyst
```

## Mô tả

API để thống kê tổng hợp số lượng bệnh nhân, bác sĩ, cuộc hẹn hoặc doanh thu theo khoảng thời gian tùy chỉnh hoặc mặc định tháng hiện tại. API sẽ so sánh với kỳ trước có cùng độ dài và chia dữ liệu thành 4 phân đoạn thời gian.

## Request Body

### Input Schema

```typescript
{
  typeSummary: 'patient' | 'doctor' | 'appointment' | 'revenue',
  dateRange?: {
    startDate: string,  // YYYY-MM-DD
    endDate: string     // YYYY-MM-DD
  }
}
```

### Field Description

- **typeSummary** (required): Loại thống kê muốn xem

  - `patient`: Thống kê số lượng bệnh nhân đăng ký
  - `doctor`: Thống kê số lượng bác sĩ được duyệt
  - `appointment`: Thống kê số lượng cuộc hẹn được tạo
  - `revenue`: Thống kê tổng doanh thu từ các đơn hàng hoàn thành

- **dateRange** (optional): Khoảng thời gian tùy chỉnh
  - Nếu không truyền: mặc định thống kê tháng hiện tại
  - **startDate**: Ngày bắt đầu (YYYY-MM-DD)
  - **endDate**: Ngày kết thúc (YYYY-MM-DD)

### Request Examples

#### Thống kê bệnh nhân - tháng hiện tại (mặc định)

```json
{
  "typeSummary": "patient"
}
```

#### Thống kê bác sĩ - khoảng thời gian tùy chỉnh

```json
{
  "typeSummary": "doctor",
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

#### Thống kê cuộc hẹn - theo quý

```json
{
  "typeSummary": "appointment",
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-03-31"
  }
}
```

#### Thống kê doanh thu - theo tuần

```json
{
  "typeSummary": "revenue",
  "dateRange": {
    "startDate": "2024-12-01",
    "endDate": "2024-12-07"
  }
}
```

#### Thống kê theo năm

```json
{
  "typeSummary": "patient",
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

## Response Format

### Success Response (200)

```json
{
  "message": "Thống kê thành công",
  "data": {
    "percent": 0.2,
    "total": 4876,
    "series": [20, 41, 63, 33]
  },
  "status": 200
}
```

### Response Fields Description

#### data object:

- **percent** (number): Tỷ lệ thay đổi so với kỳ trước có cùng độ dài

  - Giá trị dương: tăng trưởng (ví dụ: 0.2 = tăng 20%)
  - Giá trị âm: giảm (ví dụ: -0.15 = giảm 15%)
  - Giá trị 0: không thay đổi
  - Giá trị 1: tăng 100% (từ 0 lên có giá trị)

- **total** (number): Tổng số lượng trong kỳ hiện tại

  - Với `patient`: số lượng bệnh nhân có createdAt trong khoảng thời gian
  - Với `doctor`: số lượng bác sĩ có status 'approved' và createdAt trong khoảng thời gian
  - Với `appointment`: số lượng cuộc hẹn có createdAt trong khoảng thời gian
  - Với `revenue`: tổng số tiền từ các đơn hàng có status 'completed' và createdAt trong khoảng thời gian

- **series** (number[]): Mảng 4 phần tử thể hiện dữ liệu chia đều theo 4 phân đoạn thời gian
  - Khoảng thời gian được chia đều thành 4 phần
  - Ví dụ: nếu chọn 1 tháng (30 ngày) → mỗi phần ~7-8 ngày
  - Ví dụ: nếu chọn 1 tuần (7 ngày) → mỗi phần ~1-2 ngày
  - Ví dụ: nếu chọn 1 năm (365 ngày) → mỗi phần ~91 ngày (theo quý)

### Error Responses

#### Validation Error (400)

```json
{
  "message": "Validation failed",
  "status": 400
}
```

#### Server Error (500)

```json
{
  "message": "Internal server error",
  "status": 500
}
```

## Chi tiết xử lý

### Cách tính toán

1. **Thời gian hiện tại**: Sử dụng dateRange hoặc mặc định tháng hiện tại
2. **Thời gian so sánh**: Kỳ trước có cùng độ dài với kỳ hiện tại
3. **Dữ liệu**: Sử dụng field `createdAt` của các schema để thống kê chính xác thời điểm tạo
4. **Phần trăm**: `(currentPeriod - previousPeriod) / previousPeriod`
5. **Phân đoạn**: Chia khoảng thời gian thành 4 phần bằng nhau

### Ví dụ cách tính kỳ trước

- Nếu chọn: `2024-01-01` đến `2024-01-31` (31 ngày)
- Kỳ trước sẽ là: `2023-12-01` đến `2023-12-31` (31 ngày)

- Nếu chọn: `2024-12-01` đến `2024-12-07` (7 ngày)
- Kỳ trước sẽ là: `2024-11-24` đến `2024-11-30` (7 ngày)

### Database Schema được sử dụng

- **Patient Schema**: dùng cho typeSummary = 'patient'
- **Doctor Schema**: dùng cho typeSummary = 'doctor'
- **Appointment Schema**: dùng cho typeSummary = 'appointment'
- **OrderMapping Schema**: dùng cho typeSummary = 'revenue'

### Lưu ý

- API này chỉ thống kê dữ liệu trong hệ thống, không tạo mới hoặc cập nhật
- Kết quả percent được làm tròn đến 2 chữ số thập phân
- Nếu kỳ trước = 0 và kỳ hiện tại > 0, percent = 1 (tăng 100%)
- Series luôn có đúng 4 phần tử, nếu phân đoạn nào không có dữ liệu thì = 0
- dateRange hỗ trợ linh hoạt: tuần, tháng, quý, năm hoặc bất kỳ khoảng thời gian nào
- startDate phải <= endDate
