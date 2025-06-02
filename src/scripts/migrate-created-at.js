const mongoose = require('mongoose')
require('dotenv').config()

async function migrateCreatedAt() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    })

    console.log('Kết nối MongoDB thành công')

    const defaultDate = new Date()

    // 1. Migrate Patient collection
    const patientResult = await mongoose.connection.db.collection('patients').updateMany(
      { createdAt: { $exists: false } },
      {
        $set: {
          createdAt: defaultDate,
          updatedAt: defaultDate,
        },
      },
    )
    console.log(`✅ Cập nhật ${patientResult.modifiedCount} bệnh nhân không có createdAt`)

    // 2. Migrate Appointment collection
    const appointmentResult = await mongoose.connection.db.collection('appointments').updateMany(
      { createdAt: { $exists: false } },
      {
        $set: {
          createdAt: defaultDate,
          updatedAt: defaultDate,
        },
      },
    )
    console.log(`✅ Cập nhật ${appointmentResult.modifiedCount} lịch hẹn không có createdAt`)

    // 3. Migrate OrderMapping collection
    const orderResult = await mongoose.connection.db.collection('ordermappings').updateMany(
      { createdAt: { $exists: false } },
      {
        $set: {
          createdAt: defaultDate,
          updatedAt: defaultDate,
        },
      },
    )
    console.log(`✅ Cập nhật ${orderResult.modifiedCount} đơn hàng không có createdAt`)

    // 4. Migrate Doctor collection
    const doctorResult = await mongoose.connection.db.collection('doctors').updateMany(
      { createdAt: { $exists: false } },
      {
        $set: {
          createdAt: defaultDate,
          updatedAt: defaultDate,
        },
      },
    )
    console.log(`✅ Cập nhật ${doctorResult.modifiedCount} bác sĩ không có createdAt`)

    console.log('🎉 Migration hoàn thành!')
  } catch (error) {
    console.error('❌ Lỗi migration:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Đã ngắt kết nối MongoDB')
  }
}

// Chạy migration
migrateCreatedAt()
