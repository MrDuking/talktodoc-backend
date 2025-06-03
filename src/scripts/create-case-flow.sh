  #!/bin/bash

  # ===================== CONFIG =====================
  API_URL="http://localhost:3000"
  TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRoaWVucHQwMSIsInN1YiI6IjY4MzcwN2ExYjhhNDE0MjM0NzNiYWMxNSIsInJvbGUiOiJQQVRJRU5UIiwiaWF0IjoxNzQ4ODU4OTI3LCJleHAiOjE3NDg5NDUzMjd9.6FPQrgboqk9mHkp1welyVNThmSnIaP_Bgv5BZU0Qbpc" # <-- Thay bằng token thực tế
  TIMEZONE="Asia/Ho_Chi_Minh"
  AMOUNT=300000
  NUM_RECORDS=10

  # ===================== Danh sách ID =====================
  DOCTOR_ID_LIST=('67f6745b45bccd47d55f5c13' '67fe80c245117ed75e153c9a' '67fe80c245117ed75e153c9b'  '6817d216799c3b531eeed4a6' '68370ce8bc048df96f107abd')
  SPECIALTY_ID_LIST=('67eaf20d2186add4b5811e03' '67eaf20d2186add4b5811e05' '67f54027d367ebed6751378e' '67f54075d367ebed6751379d' '67f540a7d367ebed675137ad')
  PATIENT_ID_LIST=('67e3f1f06b4dbf9229f687d3' '67e3f1d36b4dbf9229f687c9' '683707a1b8a41423473bac15' '6817d384799c3b531eeed556' '6817d38d799c3b531eeed55c')
  DATE_LIST=('2025-08-20' '2025-08-21' '2025-08-22' '2025-08-23' '2025-08-24')
  SLOT_LIST=('10:00' '11:00' '12:00' '13:00' '14:00')
  # ===================== Hàm chọn ngẫu nhiên =====================
  get_random_item() {
  local array=("$@")
  echo "${array[RANDOM % ${#array[@]}]}"
  }

 # ===================== Bắt đầu tạo dữ liệu =====================
USED_DATE_SLOTS=()
for ((i = 1; i <= NUM_RECORDS; i++)); do
echo ""
echo "=========== Tạo Case #$i ==========="

DOCTOR_ID=$(get_random_item "${DOCTOR_ID_LIST[@]}")
SPECIALTY_ID=$(get_random_item "${SPECIALTY_ID_LIST[@]}")
PATIENT_ID=$(get_random_item "${PATIENT_ID_LIST[@]}")

# ===================== Random DATE và SLOT không trùng =====================
while true; do
  DATE=$(get_random_item "${DATE_LIST[@]}")
  SLOT=$(get_random_item "${SLOT_LIST[@]}")
  DATE_SLOT="$DATE|$SLOT"
  if [[ ! " ${USED_DATE_SLOTS[*]} " =~ " ${DATE_SLOT} " ]]; then
    USED_DATE_SLOTS+=("$DATE_SLOT")
    break
  fi
done

  echo ">>> Bắt đầu tạo case..."

  # ===================== STEP 1: Tạo Case =====================
  create_response=$(curl -s -X POST "$API_URL/case/data" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"specialty\": \"$SPECIALTY_ID\",
      \"action\": \"create\",
      \"patient\": \"$PATIENT_ID\"
  }")

  case_id=$(echo "$create_response" | jq -r '.data._id')

  echo "✅ Case được tạo: $case_id"

  # ===================== STEP 2: Cập nhật form bệnh =====================
  echo ">>> Cập nhật medical_form..."

  curl -s -X POST "$API_URL/case/data" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"case_id\": \"$case_id\",
      \"action\": \"save\",
      \"patient\": \"$PATIENT_ID\",
      \"specialty\": \"$SPECIALTY_ID\",
      \"medical_form\": {
        \"digestive_issues\": \"1\",
        \"duration\": \"1\"
      }
  }"

  # ===================== STEP 3: Tạo Appointment =====================
  echo ">>> Tạo appointment..."
  appointment_response=$(curl -s -X POST "$API_URL/appointments" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"case_id\": \"$case_id\",
      \"doctor\": \"$DOCTOR_ID\",
      \"date\": \"$DATE\",
      \"slot\": \"$SLOT\",
      \"timezone\": \"$TIMEZONE\",
      \"specialty\": \"$SPECIALTY_ID\"
  }")

  appointment_id=$(echo "$appointment_response" | jq -r '._id')

  if [ "$appointment_id" == "null" ] || [ -z "$appointment_id" ]; then
    echo "❌ Lỗi tạo appointment! Response:"
    echo "$appointment_response"
    exit 1
  else
    echo "✅ Appointment ID: $appointment_id"
  fi

  # ===================== STEP 4: Gắn appointment vào case =====================
  echo ">>> Gắn appointment vào case..."

  curl -s -X POST "$API_URL/case/data" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"case_id\": \"$case_id\",
      \"action\": \"save\",
      \"patient\": \"$PATIENT_ID\",
      \"appointment\": \"$appointment_id\"
  }"
  # ===================== STEP 5: Cập nhật thông tin thanh toán appointment =====================
  echo ">>> Cập nhật thông tin thanh toán appointment..."
  curl -s -X PATCH "$API_URL/appointments/$appointment_id" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"payment\": {
      \"discount\": 0,
      \"total\": $AMOUNT,
      \"paymentMethod\": \"VNPAY\"
    }
  }"
    
  echo "✅ Đã cập nhật thông tin payment cho appointment."
  echo "🧾 Discount: 0 | Total: $AMOUNT | Method: (empty)"

  # ===================== STEP 5: Tạo payment URL =====================
  echo ">>> Tạo payment URL..."

  payment_response=$(curl -s -X POST "$API_URL/payment/create-payment-url" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"patient\": \"$PATIENT_ID\",
      \"doctorId\": \"$DOCTOR_ID\",
      \"appointmentId\": \"$appointment_id\",
      \"amount\": $AMOUNT
  }")

  payment_url=$(echo "$payment_response" | jq -r '.paymentUrl // .data.paymentUrl')

  if [ -z "$payment_url" ] || [ "$payment_url" == "null" ]; then
    echo "❌ Không lấy được payment URL! Response:"
    echo "$payment_response"
    exit 1
  else
    echo "✅ Payment URL tạo thành công:"
    echo "$payment_url"
  fi

  # ===================== STEP 6: Submit Case =====================
  echo ">>> Submit case sau thanh toán..."

  curl -s -X POST "$API_URL/case/data" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"case_id\": \"$case_id\",
      \"action\": \"submit\",
      \"appointment_id\": \"$appointment_id\"
  }"

  echo "✅ Đã submit case hoàn tất."
  echo "📝 Case ID: $case_id"
  echo "📅 Appointment ID: $appointment_id"
  echo ">>> Cập nhật trạng thái thanh toán của appointment..."

  curl -s -X PATCH "$API_URL/appointments/$appointment_id" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"patient\": \"$PATIENT_ID\",
    \"payment\": {
      \"status\": \"PAID\"
    }
  }"

  echo "✅ Đã cập nhật trạng thái thanh toán thành công."
  echo "📝 Appointment ID: $appointment_id"
  echo "👤 Patient ID: $PATIENT_ID"
  echo "💰 Payment Status: PAID"
  done