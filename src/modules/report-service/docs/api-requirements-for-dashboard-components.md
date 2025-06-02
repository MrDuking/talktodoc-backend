# API Requirements for Dashboard Components

## 📋 **Tổng Quan**

Tài liệu này mô tả chi tiết các API endpoints và format dữ liệu cần thiết để Backend trả về cho các dashboard components trong TalkToDoc Frontend.

---

## 🎯 **1. API Thống Kê Trạng Thái Lịch Hẹn**

### **Endpoint:** `POST /report/appointment-status-summary`

### **Mô tả:**

API để lấy thống kê trạng thái lịch hẹn theo khoảng thời gian.

### **Request Body:**

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### **Request Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <access_token>"
}
```

### **Response Format:**

```json
{
  "message": "Success",
  "data": [
    {
      "status": "CONFIRMED",
      "statusVn": "Đã Xác Nhận",
      "count": 1250
    },
    {
      "status": "PENDING",
      "statusVn": "Đang Chờ",
      "count": 420
    },
    {
      "status": "CANCELLED",
      "statusVn": "Đã Hủy",
      "count": 180
    },
    {
      "status": "COMPLETED",
      "statusVn": "Đã Hoàn Thành",
      "count": 2100
    }
  ],
  "status": 200
}
```

### **Field Explanations:**

- `status`: Trạng thái lịch hẹn (enum: CONFIRMED, PENDING, CANCELLED, COMPLETED)
- `statusVn`: Tên trạng thái bằng tiếng Việt (optional - FE có thể tự map)
- `count`: Số lượng lịch hẹn trong trạng thái này trong khoảng thời gian

### **Status Mapping:**

```typescript
const statusMapping = {
  CONFIRMED: 'Đã Xác Nhận', // Màu xanh lá
  PENDING: 'Đang Chờ', // Màu cam
  CANCELLED: 'Đã Hủy', // Màu đỏ
  COMPLETED: 'Đã Hoàn Thành' // Màu xanh dương
}
```

### **Lưu ý Backend:**

- Tính toán số lượng lịch hẹn theo `startDate` và `endDate`
- Đảm bảo trả về đầy đủ 4 trạng thái (có thể count = 0)
- Format ngày: `YYYY-MM-DD`

---

## 👨‍⚕️ **2. API Top Bác Sĩ**

### **Endpoint:** `POST /report/top-doctors`

### **Mô tả:**

API để lấy danh sách top bác sĩ xuất sắc nhất theo khoảng thời gian.

### **Request Body:**

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "limit": 5
}
```

### **Request Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <access_token>"
}
```

### **Response Format:**

```json
{
  "message": "Success",
  "data": [
    {
      "id": "doctor_001",
      "name": "Nguyễn Văn A",
      "avatar": "https://api.talktodoc.com/uploads/avatars/doctor_001.jpg",
      "specialty": "Tim mạch",
      "experience": 15,
      "rating": 4.8,
      "totalPatients": 1250,
      "totalReviews": 890,
      "totalAppointments": 1450,
      "revenue": 125000000,
      "status": "active"
    },
    {
      "id": "doctor_002",
      "name": "Trần Thị B",
      "avatar": "https://api.talktodoc.com/uploads/avatars/doctor_002.jpg",
      "specialty": "Nhi khoa",
      "experience": 12,
      "rating": 4.9,
      "totalPatients": 980,
      "totalReviews": 756,
      "totalAppointments": 1120,
      "revenue": 89000000,
      "status": "busy"
    }
  ],
  "status": 200
}
```

### **Field Explanations:**

#### **Thông tin cơ bản:**

- `id`: ID duy nhất của bác sĩ (string)
- `name`: Họ tên bác sĩ (string)
- `avatar`: URL ảnh đại diện (string, có thể null)
- `specialty`: Chuyên khoa (string)
- `experience`: Số năm kinh nghiệm (number)

#### **Đánh giá:**

- `rating`: Điểm đánh giá trung bình (number, 0-5)
- `totalReviews`: Tổng số đánh giá (number)

#### **Thống kê trong khoảng thời gian:**

- `totalPatients`: Tổng số bệnh nhân đã khám trong time range (number)
- `totalAppointments`: Tổng số lịch hẹn trong time range (number)
- `revenue`: Doanh thu trong time range (number, đơn vị VNĐ)

#### **Trạng thái:**

- `status`: Trạng thái hoạt động (enum: "active" | "busy" | "offline")

### **Status Mapping:**

```typescript
const statusMapping = {
  active: 'Đang hoạt động', // Màu xanh lá
  busy: 'Bận', // Màu cam
  offline: 'Offline' // Màu xám
}
```

### **Ranking Logic (Gợi ý cho Backend):**

```sql
-- Sắp xếp theo thứ tự ưu tiên:
ORDER BY
  rating DESC,                    -- Điểm đánh giá cao nhất
  totalPatients DESC,             -- Số bệnh nhân nhiều nhất
  revenue DESC,                   -- Doanh thu cao nhất
  totalAppointments DESC          -- Số lịch hẹn nhiều nhất
LIMIT ?
```

### **Lưu ý Backend:**

- Chỉ tính toán `totalPatients`, `totalAppointments`, `revenue` trong khoảng thời gian được chỉ định
- `rating` và `totalReviews` là tổng từ trước đến nay (không theo time range)
- Trả về theo thứ tự ranking (bác sĩ xuất sắc nhất trước)
- Đảm bảo URL avatar hợp lệ hoặc trả về null

---

## 📊 **3. API Thống Kê Tổng Quan (Đã có)**

### **Endpoint:** `POST /report/summary-analyst`

### **Request Body:**

```json
{
  "typeSummary": "patient", // "patient" | "appointment" | "revenue"
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### **Response Format:**

```json
{
  "message": "Success",
  "data": {
    "percent": 12.5,
    "total": 1500,
    "series": [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65]
  },
  "status": 200
}
```

### **Field Explanations:**

- `percent`: Phần trăm thay đổi so với kỳ trước (number, có thể âm)
- `total`: Tổng số trong khoảng thời gian (number)
- `series`: Dữ liệu theo tháng để vẽ chart (array of numbers, 12 phần tử)

---

## 🔧 **4. Quy Tắc Chung Cho Backend**

### **Authentication:**

- Tất cả API đều yêu cầu Bearer token
- Kiểm tra quyền truy cập (role-based)

### **Date Format:**

- Input: `YYYY-MM-DD` (ISO date format)
- Timezone: UTC+7 (Asia/Ho_Chi_Minh)

### **Error Response:**

```json
{
  "message": "Error description",
  "data": null,
  "status": 400
}
```

### **Performance:**

- Cache dữ liệu thống kê để giảm thời gian response
- Pagination cho danh sách lớn
- Optimize query với proper indexing

### **Validation:**

- Kiểm tra `startDate <= endDate`
- Giới hạn range tối đa (ví dụ: 1 năm)
- Validate format ngày tháng

---

## 📱 **5. Frontend Usage Examples**

### **AppCurrentDownload Component:**

```tsx
// Với date picker enabled
<AppCurrentDownload
  title="Thống Kê Trạng Thái Lịch Hẹn"
  enableDatePicker={true}
/>

// Với time range cố định
<AppCurrentDownload
  title="Thống Kê Trạng Thái Lịch Hẹn"
  startDate="2024-01-01"
  endDate="2024-12-31"
  enableDatePicker={false}
/>
```

### **AppTopDoctors Component:**

```tsx
// Với date picker enabled
<AppTopDoctors
  title="Top Bác Sĩ"
  enableDatePicker={true}
  limit={10}
/>

// Với data từ props
<AppTopDoctors
  title="Top Bác Sĩ"
  list={doctorsData}
  enableDatePicker={false}
/>
```

---

## ⚠️ **6. Lưu Ý Quan Trọng**

### **Cho Backend Team:**

1. **Luôn mô tả response mẫu + giải thích từng field**
2. **Mọi endpoint trả về `data` phải thống nhất field theo format**
3. **Sai định dạng phải update lại docs trước khi merge**
4. **Field nào FE ignore hoặc chỉ cho BE xài thì note rõ**

### **Data Consistency:**

- Response format phải nhất quán: `{ message, data, status }`
- Date format: `YYYY-MM-DD`
- Number format: Integer/Float (không có string)
- Boolean: true/false (không có "true"/"false")

### **Testing:**

- Test với các edge cases: no data, invalid date range
- Verify performance với large datasets
- Check authorization cho different user roles

---

## 🚀 **7. Implementation Priority**

1. **High Priority:** `/report/appointment-status-summary`
2. **Medium Priority:** `/report/top-doctors`
3. **Low Priority:** Optimization và caching

---

**Liên hệ Frontend Team nếu cần clarify thêm requirements!** 🤝
