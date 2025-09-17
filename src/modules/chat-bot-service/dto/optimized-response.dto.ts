/**
 * 🎯 Optimized Response DTOs for Frontend UI
 * Chỉ chứa các trường cần thiết cho UI, có ID đầy đủ
 */

// ===== BASE INTERFACES =====

export interface BaseResponse {
  success: boolean
  reply: string
  timestamp: string
  model: string
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

export interface JsonResponse<T = Record<string, unknown>> {
  type: string
  data: T
}

// ===== APPOINTMENT INFO RESPONSE =====

export interface AppointmentInfoResponse extends BaseResponse {
  jsonData?: JsonResponse<AppointmentInfoData>
}

export interface AppointmentInfoData {
  hasAppointment: boolean
  totalAppointments: number
  nextAppointment?: {
    id: string
    date: string
    time: string
    status: string
    doctor: string
    specialty: string
    reason: string
  }
  recentAppointments: Array<{
    id: string
    date: string
    time: string
    status: string
    doctor: string
  }>
  summary: {
    pending: number
    confirmed: number
    completed: number
  }
}

// ===== APPOINTMENT SUGGESTION RESPONSE =====

export interface AppointmentSuggestionResponse extends BaseResponse {
  jsonData?: JsonResponse<AppointmentSuggestionData>
}

export interface AppointmentSuggestionData {
  suggested: boolean
  reason: string
  urgency: 'low' | 'normal' | 'high'
  recommendedSpecialty: string
  detectedSymptoms: string[]
  // Chỉ 3-5 bác sĩ phù hợp nhất
  recommendedDoctors: Array<{
    id: string
    name: string
    specialty: string
    experience: number
    rating: number
    hospital: string
    nextAvailable: string
    price: number
  }>
  
  // Chỉ 3 ngày gần nhất
  availableSlots: Array<{
    date: string
    dayOfWeek: string
    slots: Array<{
      id: string
      time: string
      price: number
      available: boolean
    }>
  }>
  
  // Pricing summary đơn giản
  pricing: {
    total: number
    currency: string
  }
}

// ===== SYMPTOM ANALYSIS RESPONSE =====

export interface SymptomAnalysisResponse extends BaseResponse {
  jsonData?: JsonResponse<SymptomAnalysisData>
}

export interface SymptomAnalysisData {
  symptoms: string[]
  severity: 'mild' | 'moderate' | 'severe'
  recommendation: string
  suggestedSpecialty: string
  urgency: 'low' | 'normal' | 'high'
}

// ===== PATIENT INFO RESPONSE =====

export interface PatientInfoResponse extends BaseResponse {
  jsonData?: JsonResponse<PatientInfoData>
}

export interface PatientInfoData {
  hasInfo: boolean
  name?: string
  age?: string
  gender?: string
  phone?: string
}

// ===== GENERAL INFO RESPONSE =====

export interface GeneralInfoResponse extends BaseResponse {
  jsonData?: JsonResponse<GeneralInfoData>
}

export interface GeneralInfoData {
  message: string
  timestamp: string
}

// ===== UNION TYPES =====

export type ChatJsonResponse = 
  | AppointmentInfoResponse
  | AppointmentSuggestionResponse
  | SymptomAnalysisResponse
  | PatientInfoResponse
  | GeneralInfoResponse

export type ChatJsonData = 
  | AppointmentInfoData
  | AppointmentSuggestionData
  | SymptomAnalysisData
  | PatientInfoData
  | GeneralInfoData

// ===== REQUEST DTOs =====

export interface SendJsonMessageRequest {
  message: string
  user_id: string
  imageUrls?: string[]
  model?: string
  requireJsonResponse?: boolean
  jsonResponseType?: 'appointment_info' | 'appointment_suggestion' | 'symptom_analysis' | 'patient_info' | 'general_info'
}

// ===== UI HELPER TYPES =====

export interface DoctorCard {
  id: string
  name: string
  specialty: string
  experience: number
  rating: number
  hospital: string
  nextAvailable: string
  price: number
}

export interface TimeSlotCard {
  id: string
  time: string
  price: number
  available: boolean
}

export interface AppointmentCard {
  id: string
  date: string
  time: string
  status: string
  doctor: string
  specialty?: string
  reason?: string
}

export interface SymptomTag {
  symptom: string
  severity: 'mild' | 'moderate' | 'severe'
}

// ===== RESPONSE TYPE GUARDS =====

export function isAppointmentInfoResponse(response: ChatJsonResponse): response is AppointmentInfoResponse {
  return response.jsonData?.type === 'appointment_info'
}

export function isAppointmentSuggestionResponse(response: ChatJsonResponse): response is AppointmentSuggestionResponse {
  return response.jsonData?.type === 'appointment_suggestion'
}

export function isSymptomAnalysisResponse(response: ChatJsonResponse): response is SymptomAnalysisResponse {
  return response.jsonData?.type === 'symptom_analysis'
}

export function isPatientInfoResponse(response: ChatJsonResponse): response is PatientInfoResponse {
  return response.jsonData?.type === 'patient_info'
}

export function isGeneralInfoResponse(response: ChatJsonResponse): response is GeneralInfoResponse {
  return response.jsonData?.type === 'general_info'
}

// ===== EXAMPLE USAGE =====

/*
// Frontend usage example:
const handleChatResponse = (response: ChatJsonResponse) => {
  if (isAppointmentSuggestionResponse(response)) {
    const { recommendedDoctors, availableSlots, pricing } = response.jsonData.data
    
    // Render doctor cards
    recommendedDoctors.forEach(doctor => {
      console.log(`${doctor.name} - ${doctor.specialty} - ${doctor.rating}⭐`)
    })
    
    // Render time slots
    availableSlots.forEach(day => {
      console.log(`${day.dayOfWeek} ${day.date}:`)
      day.slots.forEach(slot => {
        console.log(`  ${slot.time} - ${slot.price.toLocaleString()} VND`)
      })
    })
  }
  
  if (isSymptomAnalysisResponse(response)) {
    const { symptoms, severity, recommendation } = response.jsonData.data
    
    // Render symptom tags
    symptoms.forEach(symptom => {
      console.log(`Symptom: ${symptom} (${severity})`)
    })
    
    // Show recommendation
    console.log(`Recommendation: ${recommendation}`)
  }
}
*/
