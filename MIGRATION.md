# Migration Guide - CreatedAt Fields

## Tổng quan

Hướng dẫn migration để đảm bảo tất cả các document trong database có field `createdAt` với giá trị mặc định là thời gian hiện tại.

## Các schema được cập nhật

### 1. Patient Schema

- ✅ Đã có `timestamps: true` - tự động tạo `createdAt` và `updatedAt`
- ✅ Thêm logic kiểm tra `createdAt` trong pre-save middleware
- ✅ Report service sử dụng `createdAt` để thống kê đăng ký bệnh nhân

### 2. Appointment Schema

- ✅ Đã có `timestamps: true` - tự động tạo `createdAt` và `updatedAt`
- ✅ Thêm field `completedAt` để tracking thời gian hoàn thành
- ✅ Thêm logic tự động set `completedAt` khi status = COMPLETED
- ✅ Report service sử dụng `createdAt` để thống kê tạo lịch hẹn

### 3. OrderMapping Schema (Revenue)

- ✅ Thêm `timestamps: true`
- ✅ Cập nhật field `createdAt` có default value
- ✅ Report service sử dụng `createdAt` để thống kê doanh thu

### 4. Doctor Schema

- ✅ Đã có `timestamps: true` - tự động tạo `createdAt` và `updatedAt`
- ✅ Report service sử dụng `createdAt` để thống kê đăng ký bác sĩ

## Chạy Migration

### Bước 1: Backup Database

```bash
# Backup toàn bộ database trước khi migration
mongodump --uri="mongodb://localhost:27017/talktodoc" --out=./backup-$(date +%Y%m%d)
```

### Bước 2: Chạy Script Migration

```bash
# Chạy script migration để set createdAt cho data cũ
npm run migrate:created-at
```

### Bước 3: Kiểm tra kết quả

```bash
# Kiểm tra trong MongoDB
mongo talktodoc
db.patients.find({createdAt: {$exists: false}}).count()    # Phải = 0
db.appointments.find({createdAt: {$exists: false}}).count() # Phải = 0
db.ordermappings.find({createdAt: {$exists: false}}).count() # Phải = 0
db.doctors.find({createdAt: {$exists: false}}).count()      # Phải = 0
```

## Script Migration Chi Tiết

Script `src/scripts/migrate-created-at.js` thực hiện:

1. **Kết nối MongoDB** sử dụng config từ `.env`
2. **Cập nhật Patient collection**: Set `createdAt` và `updatedAt` cho documents chưa có
3. **Cập nhật Appointment collection**: Set `createdAt` và `updatedAt` cho documents chưa có
4. **Cập nhật OrderMapping collection**: Set `createdAt` và `updatedAt` cho documents chưa có
5. **Cập nhật Doctor collection**: Set `createdAt` và `updatedAt` cho documents chưa có

## Tác động đến Report Service

### Trước Migration

- Patient: thống kê theo `updatedAt` (không chính xác)
- Doctor: thống kê theo `updatedAt` (không chính xác)
- Appointment: thống kê theo `updatedAt` với filter `status = COMPLETED`
- Revenue: thống kê theo `completedAt`

### Sau Migration

- Patient: thống kê theo `createdAt` (chính xác thời điểm đăng ký)
- Doctor: thống kê theo `createdAt` (chính xác thời điểm đăng ký)
- Appointment: thống kê theo `createdAt` (chính xác thời điểm tạo lịch hẹn)
- Revenue: thống kê theo `createdAt` (chính xác thời điểm tạo đơn hàng)

## Lưu ý quan trọng

### 1. Timestamp Consistency

- Tất cả documents mới sẽ tự động có `createdAt` và `updatedAt`
- Documents cũ sẽ được set `createdAt` = `updatedAt` = thời điểm migration

### 2. Appointment Logic

```typescript
// Tự động set completedAt khi appointment được hoàn thành
if (this.status === 'COMPLETED' && !this.completedAt) {
  this.completedAt = new Date()
}
```

### 3. Report Accuracy

- Thống kê sẽ chính xác hơn sau migration
- Data cũ sẽ có thời gian migration làm baseline

## Troubleshooting

### Lỗi kết nối MongoDB

```bash
# Kiểm tra .env file
cat .env | grep MONGODB

# Test kết nối
node -e "
require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('DB_NAME:', process.env.DB_NAME);
"
```

### Chạy lại Migration

Script migration an toàn để chạy nhiều lần. Chỉ cập nhật documents chưa có `createdAt`.

```bash
# Có thể chạy lại an toàn
npm run migrate:created-at
```

### Rollback (nếu cần)

```bash
# Restore từ backup
mongorestore --uri="mongodb://localhost:27017/talktodoc" --drop ./backup-YYYYMMDD/talktodoc
```

## Kiểm tra sau Migration

```javascript
// Kiểm tra trong MongoDB Shell
use talktodoc

// 1. Tất cả documents phải có createdAt
db.patients.find({createdAt: {$exists: false}}).count()
db.appointments.find({createdAt: {$exists: false}}).count()
db.ordermappings.find({createdAt: {$exists: false}}).count()
db.doctors.find({createdAt: {$exists: false}}).count()

// 2. Kiểm tra sample data
db.patients.findOne({}, {createdAt: 1, updatedAt: 1})
db.appointments.findOne({}, {createdAt: 1, updatedAt: 1, completedAt: 1})
```

## Kết luận

Migration này đảm bảo:

- ✅ Tất cả schemas có `createdAt` field
- ✅ Report service sử dụng `createdAt` để thống kê chính xác
- ✅ Appointment có `completedAt` để tracking hoàn thành
- ✅ Backward compatibility với data cũ
- ✅ Forward compatibility với data mới
