# Appointment Context Enhancement

## Tổng quan

Cải thiện context và logic xử lý câu hỏi về lịch hẹn để AI có thể trả lời chi tiết và chính xác dựa trên câu hỏi cụ thể của bệnh nhân.

## Các cải thiện đã thực hiện

### 1. Cải thiện System Prompt

Thêm hướng dẫn chi tiết cho AI về cách xử lý các loại câu hỏi về lịch hẹn:

```
**XỬ LÝ CÂU HỎI VỀ LỊCH HẸN**:
Khi người dùng hỏi về lịch hẹn, hãy phân tích câu hỏi và trả lời phù hợp:

1. **Hỏi về lịch hẹn tổng quát** (VD: "Lịch hẹn của tôi", "Tôi có lịch hẹn nào không"):
   - Trả về thông tin tổng quan về tất cả lịch hẹn
   - Nêu rõ số lượng, trạng thái, lịch hẹn gần nhất

2. **Hỏi về lịch hẹn cụ thể** (VD: "Lịch hẹn ngày mai", "Lịch hẹn với BS. A"):
   - Tìm và trả về thông tin chi tiết về lịch hẹn được hỏi
   - Bao gồm thời gian, bác sĩ, chuyên khoa, trạng thái

3. **Hỏi về trạng thái lịch hẹn** (VD: "Lịch hẹn đã xác nhận chưa", "Tại sao lịch hẹn bị hủy"):
   - Giải thích trạng thái cụ thể và lý do
   - Đưa ra hướng dẫn tiếp theo nếu cần

4. **Hỏi về thay đổi lịch hẹn** (VD: "Tôi muốn đổi lịch hẹn", "Hủy lịch hẹn"):
   - Hướng dẫn cách thay đổi/hủy lịch hẹn
   - Lưu ý về thời gian và điều kiện
```

### 2. Cải thiện Appointment Context Format

#### Trước khi cải thiện:
```
**Lịch hẹn gần đây:**
- Ngày: 2024-01-20, Giờ: 14:00, Trạng thái: CONFIRMED
- Ngày: 2024-01-18, Giờ: 09:00, Trạng thái: COMPLETED
```

#### Sau khi cải thiện:
```
**CHI TIẾT LỊCH HẸN**:
1. **APT001**
   - Bác sĩ: BS. Nguyễn Văn A (Nội khoa)
   - Ngày hẹn: 2024-01-20 lúc 14:00
   - Trạng thái: Đã xác nhận
   - Lý do khám: Đau đầu
   - Ngày tạo: 15/01/2024
   - Phí khám: 500,000 VNĐ

**TỔNG QUAN LỊCH HẸN**:
- Tổng số lịch hẹn: 3
- Chờ xác nhận: 0
- Đã xác nhận: 1
- Hoàn thành: 2
- Đã hủy: 0
- Bị từ chối: 0

**LỊCH HẸN TIẾP THEO**:
- ID: APT001
- Bác sĩ: BS. Nguyễn Văn A
- Ngày: 2024-01-20 lúc 14:00
- Trạng thái: Đã xác nhận

**HƯỚNG DẪN TRẢ LỜI**:
- Khi hỏi về "lịch hẹn của tôi": Trả về thông tin tổng quan và lịch hẹn gần nhất
- Khi hỏi về "lịch hẹn ngày X": Tìm và trả về lịch hẹn trong ngày đó
- Khi hỏi về "trạng thái lịch hẹn": Giải thích trạng thái hiện tại và ý nghĩa
- Khi hỏi về "bác sĩ X": Tìm lịch hẹn với bác sĩ đó
- Khi hỏi về "hủy/đổi lịch hẹn": Hướng dẫn cách thực hiện
```

### 3. Thêm Logic Phân Tích Câu Hỏi

#### Method `analyzeAppointmentQuestion`
Phân tích câu hỏi của người dùng và trả về thông tin phù hợp:

```typescript
private analyzeAppointmentQuestion(message: string, appointments: PopulatedAppointment[]): string {
  const lowerMessage = message.toLowerCase()
  
  // Kiểm tra từ khóa liên quan đến lịch hẹn
  const appointmentKeywords = ['lịch hẹn', 'appointment', 'hẹn', 'khám', 'đặt lịch']
  const hasAppointmentKeyword = appointmentKeywords.some(keyword => lowerMessage.includes(keyword))
  
  if (!hasAppointmentKeyword) return ''

  // Phân tích loại câu hỏi và trả về thông tin phù hợp
  if (lowerMessage.includes('tổng quát') || lowerMessage.includes('của tôi')) {
    return this.getGeneralAppointmentInfo(appointments)
  }
  
  if (lowerMessage.includes('ngày mai') || lowerMessage.includes('hôm nay')) {
    return this.getSpecificDateAppointments(message, appointments)
  }
  
  // ... các loại câu hỏi khác
}
```

#### Các Helper Methods

1. **`getGeneralAppointmentInfo`**: Thông tin tổng quát về lịch hẹn
2. **`getSpecificDateAppointments`**: Lịch hẹn theo ngày cụ thể
3. **`getAppointmentStatusInfo`**: Thông tin trạng thái lịch hẹn
4. **`getDoctorSpecificAppointments`**: Lịch hẹn với bác sĩ cụ thể

### 4. Tích Hợp Vào System Prompt

AI sẽ nhận được cả context chi tiết và phân tích câu hỏi:

```
${contextualInfo}
${appointmentInfo}

**PHÂN TÍCH CÂU HỎI VỀ LỊCH HẸN**:
Bạn có tổng cộng 3 lịch hẹn:
- 1 lịch hẹn đã xác nhận
- 0 lịch hẹn chờ xác nhận

Lịch hẹn tiếp theo của bạn:
- Bác sĩ: BS. Nguyễn Văn A
- Ngày: 2024-01-20 lúc 14:00
- Trạng thái: Đã xác nhận

**LƯU Ý**: Sử dụng thông tin phân tích trên để trả lời chính xác câu hỏi của người dùng về lịch hẹn.
```

## Ví dụ sử dụng

### Test Case 1: Câu hỏi tổng quát
```
Input: "Lịch hẹn của tôi"
Expected Analysis: getGeneralAppointmentInfo()
Expected Response: "Bạn có tổng cộng 3 lịch hẹn: 1 đã xác nhận, 0 chờ xác nhận. Lịch hẹn tiếp theo: BS. Nguyễn Văn A, 20/01/2024 lúc 14:00"
```

### Test Case 2: Câu hỏi theo ngày
```
Input: "Lịch hẹn ngày mai"
Expected Analysis: getSpecificDateAppointments()
Expected Response: "Lịch hẹn của bạn vào ngày mai: 14:00 - BS. Nguyễn Văn A (Đã xác nhận)"
```

### Test Case 3: Câu hỏi về trạng thái
```
Input: "Trạng thái lịch hẹn của tôi"
Expected Analysis: getAppointmentStatusInfo()
Expected Response: "Trạng thái lịch hẹn của bạn: Đã xác nhận: 1 lịch hẹn, Hoàn thành: 2 lịch hẹn"
```

### Test Case 4: Câu hỏi về bác sĩ
```
Input: "Lịch hẹn với BS. Nguyễn"
Expected Analysis: getDoctorSpecificAppointments()
Expected Response: "Lịch hẹn với bác sĩ: 2024-01-20 14:00: Đã xác nhận"
```

## Lợi ích

1. **Trả lời chính xác**: AI hiểu được ý định của người dùng và trả lời phù hợp
2. **Thông tin chi tiết**: Cung cấp đầy đủ thông tin về lịch hẹn
3. **Tự động phân tích**: Không cần người dùng hỏi theo format cứng nhắc
4. **Hướng dẫn rõ ràng**: AI biết cách xử lý từng loại câu hỏi
5. **Context phong phú**: Cung cấp thông tin tổng quan và chi tiết

## Tương lai

- Thêm NLP để phân tích câu hỏi phức tạp hơn
- Hỗ trợ tìm kiếm theo thời gian tương đối ("tuần sau", "tháng trước")
- Tích hợp với calendar để hiển thị lịch hẹn theo tuần/tháng
- Thêm thông báo nhắc nhở lịch hẹn
