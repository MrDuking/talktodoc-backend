import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { OpenAI } from 'openai'
import { AppointmentService } from '../appointments_service/appointment.service'
import { Appointment } from '../appointments_service/schemas/appointment.schema'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { CaseService } from '../case/case.service'
import { SpecialtyService } from '../specialty_service/specialty.service'
import { Patient } from '../user-service/schemas/patient.schema'
import { UsersService } from '../user-service/user.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { ChatConversation, ChatMessage } from './schemas/chat-conversation.schema'
import { getEmbedding } from './utils/embedding.util'
import { getTopKSimilarMessages } from './utils/similarity.util'

const IMAGE_URL_REGEX = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg|bmp|tiff|tif|ico|heic|avif))/i

@Injectable()
export class ChatService {
  private openai: OpenAI
  private readonly logger = new Logger(ChatService.name)

  constructor(
    @InjectModel(ChatConversation.name)
    private readonly chatModel: Model<ChatConversation>,
    private readonly configService: ConfigService,
    private readonly appointmentService: AppointmentService,
    private readonly usersService: UsersService,
    private readonly caseService: CaseService,
    private readonly specialtyService: SpecialtyService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    })
  }

  async createConversation(dto: CreateConversationDto): Promise<ChatConversation> {
    const conversation = new this.chatModel({
      user_id: dto.user_id,
      messages: [],
      model_used: 'gpt-3.5-turbo',
      context: dto.context || {},
    })
    return conversation.save()
  }

  async getConversationById(id: string): Promise<ChatConversation> {
    const convo = await this.chatModel.findById(id)
    if (!convo) throw new NotFoundException('Cuộc hội thoại không tồn tại')
    return convo
  }

  async sendMessage(
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<{ reply: string; messages: ChatMessage[] }> {
    const convo = await this.chatModel.findById(conversationId)
    if (!convo) throw new NotFoundException('Cuộc hội thoại không tồn tại')

    // Query patient info & appointments with enhanced doctor and specialty details
    let patientInfo: Patient | null = null
    let appointments: Appointment[] = []
    let cases: Record<string, unknown>[] = []
    let allSpecialties: Record<string, unknown>[] = []
    console.log('convo.user_id', convo)
    if (convo.user_id) {
      try {
        console.log('convo.user_id', convo.user_id)
        patientInfo = await this.usersService.getPatientById(convo.user_id)
      } catch (err) {
        this.logger.warn('Không lấy được thông tin bệnh nhân', err)
      }
      console.log('patientInfo', patientInfo)

      // Lấy tất cả các chuyên khoa để có thông tin tham khảo
      try {
        const specialties = await this.specialtyService.getAllSpecialties()
        allSpecialties = specialties.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description || 'Không có mô tả',
          config: s.config || {},
          isActive: s.isActive,
        }))
      } catch (err) {
        this.logger.warn('Không lấy được danh sách chuyên khoa', err)
      }

      try {
        const jwtPayload: JwtPayload = {
          userId: convo.user_id,
          username: patientInfo?.username || '',
          role: 'PATIENT',
        }
        // Tăng limit để lấy thêm appointments gần đây và bao gồm cả status PENDING
        const apptResult = await this.appointmentService.findAppointments(
          jwtPayload,
          undefined,
          1,
          10, // Tăng từ 3 lên 10 để có thêm context
        )
        appointments = apptResult.data || []

        // Lấy thông tin case liên quan đến appointments
        try {
          const caseResult = await this.caseService.findAll(jwtPayload, 1, 20) // Lấy 20 cases gần đây
          cases = caseResult.data || []
        } catch (err) {
          this.logger.warn('Không lấy được thông tin case', err)
        }
      } catch (err) {
        this.logger.warn('Không lấy được lịch hẹn', err)
      }
    }

    // Merge context with enhanced appointment, case, and specialty information
    const context = {
      ...(convo.context && typeof convo.context === 'object' ? convo.context : {}),
      patient: patientInfo
        ? {
            fullName: patientInfo.fullName,
            gender: patientInfo.gender,
            birthDate: patientInfo.birthDate,
            phoneNumber: patientInfo.phoneNumber,
            medicalHistory: patientInfo.medicalHistory || [],
          }
        : undefined,
      specialties: allSpecialties,
      appointments: Array.isArray(appointments)
        ? appointments.map(a => {
            let doctorName = ''
            let specialtyName = ''
            let specialtyDescription = ''
            let doctorExperience = 0
            let doctorRating = 0
            let hospitalName = ''
            let doctorPosition = ''

            const doc = a.doctor as unknown
            const spec = a.specialty as unknown

            if (doc && typeof doc === 'object') {
              const doctor = doc as Record<string, unknown>
              doctorName = (doctor.fullName as string) || 'Chưa xác định'
              doctorExperience = (doctor.experienceYears as number) || 0
              doctorRating = (doctor.avgScore as number) || 0
              doctorPosition = (doctor.position as string) || 'Bác sĩ'

              // Lấy thông tin bệnh viện nếu có
              if (doctor.hospital && typeof doctor.hospital === 'object') {
                const hospital = doctor.hospital as Record<string, unknown>
                hospitalName = (hospital.name as string) || 'Chưa xác định'
              }
            }

            if (spec && typeof spec === 'object') {
              const specialty = spec as Record<string, unknown>
              specialtyName = (specialty.name as string) || 'Chưa xác định'
              specialtyDescription = (specialty.description as string) || 'Không có mô tả'
            }

            return {
              appointmentId: a.appointmentId,
              date: a.date,
              slot: a.slot,
              doctor: {
                name: doctorName,
                experience: doctorExperience,
                rating: doctorRating,
                position: doctorPosition,
                hospital: hospitalName,
              },
              specialty: {
                name: specialtyName,
                description: specialtyDescription,
              },
              reason: a.reason || 'Không có',
              status: a.status,
              doctorNote: a.doctorNote || 'Chưa có ghi chú',
              paymentStatus: a.payment?.status || 'Chưa thanh toán',
              paymentTotal: a.payment?.total || 0,
              duration: a.duration_call || 'Chưa xác định',
              confirmedAt: a.confirmedAt
                ? new Date(a.confirmedAt).toLocaleDateString('vi-VN')
                : null,
              completedAt: a.completedAt
                ? new Date(a.completedAt).toLocaleDateString('vi-VN')
                : null,
              rating: a.rating
                ? `${a.rating.ratingScore}/5 - ${a.rating.description}`
                : 'Chưa đánh giá',
              createdAt: new Date(a.createdAt).toLocaleDateString('vi-VN'),
            }
          })
        : [],
      cases: Array.isArray(cases)
        ? cases.map(c => {
            const medicalForm = (c.medicalForm as Record<string, unknown>) || {}
            const specialty = (c.specialty as Record<string, unknown>) || {}
            const offers = (c.offers as Record<string, unknown>[]) || []

            return {
              caseId: c.caseId,
              status: c.status,
              specialty: specialty.name || 'Chưa xác định',
              symptoms: medicalForm.symptoms || 'Không có',
              diagnosis: medicalForm.diagnosis || 'Chưa có chẩn đoán',
              treatment: medicalForm.treatment || 'Chưa có điều trị',
              followup: medicalForm.followup || 'Chưa có theo dõi',
              note: medicalForm.note || 'Không có ghi chú',
              questions: Array.isArray(medicalForm.questions)
                ? (medicalForm.questions as Array<{ question: string; answer: string }>)
                    .map(q => `${q.question}: ${q.answer}`)
                    .join('; ')
                : 'Không có',
              medicationsCount: offers.length,
              latestOffer:
                offers.length > 0
                  ? {
                      createdAt: offers[offers.length - 1].createdAt,
                      note: offers[offers.length - 1].note || 'Không có ghi chú',
                      medicationsCount: ((offers[offers.length - 1].medications as unknown[]) || [])
                        .length,
                    }
                  : null,
              createdAt: new Date(c.createdAt as string).toLocaleDateString('vi-VN'),
              updatedAt: new Date(c.updatedAt as string).toLocaleDateString('vi-VN'),
            }
          })
        : [],
    }

    const imageUrlsFromText = []
    let textContent = dto.message
    let match
    const regex = new RegExp(IMAGE_URL_REGEX, 'gi')
    while ((match = regex.exec(dto.message)) !== null) {
      imageUrlsFromText.push(match[0])
      textContent = textContent.replace(match[0], '').trim()
    }

    const imageUrls = [...imageUrlsFromText, ...(dto.imageUrls || [])]

    let reply = ''
    if (imageUrls.length > 0) {
      try {
        const userContent = []
        if (textContent) {
          userContent.push({ type: 'text' as const, text: textContent })
        }
        imageUrls.forEach(url => {
          userContent.push({ type: 'image_url' as const, image_url: { url } })
        })

        const visionResponse = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                'Bạn là trợ lý AI TalkToDoc. Phân tích ảnh nếu có và hỗ trợ bệnh nhân một cách an toàn, không chẩn đoán.',
            },
            {
              role: 'user',
              content: userContent,
            },
          ],
          temperature: 0.6,
          max_tokens: 3000,
        })

        reply =
          visionResponse.choices[0].message.content ?? 'Xin lỗi, tôi không thể phân tích ảnh này.'
      } catch (err) {
        this.logger.error('Lỗi khi gọi OpenAI Vision API', err)
        reply =
          'Xin lỗi, hiện tại tôi chưa thể phân tích ảnh. Vui lòng thử lại sau hoặc gửi câu hỏi dạng văn bản.'
      }

      convo.messages.push({
        role: 'user',
        content: textContent,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      })
      convo.messages.push({ role: 'assistant', content: reply })
      await convo.save()
      return { reply, messages: convo.messages as ChatMessage[] }
    }

    convo.messages.push({ role: 'user', content: dto.message })

    const queryEmbedding = await getEmbedding(dto.message, this.configService)
    const messageEmbeddings = await Promise.all(
      convo.messages.map(async (m, i) => ({
        index: i,
        embedding: await getEmbedding(m.content, this.configService),
      })),
    )
    const topIndexes = getTopKSimilarMessages(messageEmbeddings, queryEmbedding, 5)
    const contextMessages = topIndexes.map(i => convo.messages[i])

    const contextualInfo = context.patient
      ? `
  **Thông tin bệnh nhân:**
  - Họ và tên: ${context.patient.fullName}
  - Giới tính: ${context.patient.gender === 'male' ? 'Nam' : 'Nữ'}
  - Ngày sinh: ${new Date(context.patient.birthDate).toLocaleDateString('vi-VN')}
  - Số điện thoại: ${context.patient.phoneNumber}
  - Tiền sử bệnh: ${
    context.patient.medicalHistory.length > 0
      ? context.patient.medicalHistory.join(', ')
      : 'Không có'
  }
  
  **Lịch sử khám và lịch hẹn:**
  ${
    context.appointments.length > 0
      ? context.appointments
          .map(
            a =>
              `- **Mã lịch hẹn:** ${a.appointmentId}
  - **Ngày:** ${new Date(a.date).toLocaleDateString('vi-VN')} - **Giờ:** ${a.slot}
  - **Bác sĩ:** ${a.doctor.name} (${a.doctor.position})
    - **Kinh nghiệm:** ${a.doctor.experience} năm
    - **Đánh giá:** ${a.doctor.rating}/10 điểm
    - **Bệnh viện:** ${a.doctor.hospital}
  - **Chuyên khoa:** ${a.specialty.name}
    - **Mô tả:** ${a.specialty.description}
  - **Trạng thái:** ${a.status} ${a.confirmedAt ? `(Xác nhận: ${a.confirmedAt})` : ''}
  - **Lý do khám:** ${a.reason}
  - **Ghi chú bác sĩ:** ${a.doctorNote}
  - **Thanh toán:** ${a.paymentStatus} ${a.paymentTotal > 0 ? `(${a.paymentTotal.toLocaleString('vi-VN')} VNĐ)` : ''}
  - **Thời gian tư vấn:** ${a.duration}
  - **Đánh giá cuộc hẹn:** ${a.rating}
  - **Ngày tạo:** ${a.createdAt}`,
          )
          .join('\n\n')
      : '- Chưa có lịch hẹn nào.'
  }

  **Lịch sử bệnh án (Cases):**
  ${
    context.cases.length > 0
      ? context.cases
          .map(
            c =>
              `- **Mã bệnh án:** ${c.caseId}
  - **Trạng thái:** ${(c.status as string).toUpperCase()}
  - **Chuyên khoa:** ${c.specialty}
  - **Triệu chứng:** ${c.symptoms}
  - **Chẩn đoán:** ${c.diagnosis}
  - **Điều trị:** ${c.treatment}
  - **Theo dõi:** ${c.followup}
  - **Ghi chú:** ${c.note}
  - **Câu hỏi & trả lời:** ${c.questions}
  - **Số đơn thuốc:** ${c.medicationsCount}
  ${c.latestOffer ? `- **Đơn thuốc gần nhất:** ${new Date(c.latestOffer.createdAt as string).toLocaleDateString('vi-VN')} (${c.latestOffer.medicationsCount} loại thuốc)` : ''}
  - **Ngày tạo:** ${c.createdAt} - **Cập nhật:** ${c.updatedAt}`,
          )
          .join('\n\n')
      : '- Chưa có bệnh án nào.'
  }

  **Các chuyên khoa có sẵn tại hệ thống:**
  ${
    context.specialties.length > 0
      ? context.specialties
          .slice(0, 10) // Hiển thị tối đa 10 chuyên khoa
          .map(s => `- **${s.name}:** ${s.description}`)
          .join('\n')
      : '- Không có thông tin chuyên khoa.'
  }
  `.trim()
      : '**Không có thông tin bệnh nhân cụ thể.**'
    console.log('contextualInfo', contextualInfo)
    const chatResponse = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `
Bạn là trợ lý AI TalkToDoc, hỗ trợ tư vấn sức khỏe **sơ bộ** và cung cấp thông tin cá nhân hóa cho bệnh nhân.

---

❗ **QUY TẮC BẮT BUỘC**:

- **VỀ Y TẾ**:
  - Được phép phân tích triệu chứng **để gợi ý loại bệnh có thể liên quan**.
  - Được giải thích **công dụng của thuốc** nếu người dùng cung cấp tên thuốc.
  - Tuyệt đối **KHÔNG** gợi ý thuốc, liều lượng, nơi mua, hoặc đưa ra chẩn đoán khẳng định.
  - Phải luôn gợi ý gặp bác sĩ để xác nhận.

- **VỀ THÔNG TIN LỊCH HẸN**:
  - **Ưu tiên hàng đầu** khi người dùng hỏi về:
    - Thời gian lịch hẹn
    - Tên bác sĩ
    - Trạng thái cuộc hẹn
  - Trả lời chính xác, rõ ràng, ngắn gọn và nhấn mạnh thông tin.

- **VỀ CÂU HỎI NGOÀI Y TẾ**:
  - Được phép trả lời ở mức **cơ bản, khái quát**, không đi sâu hoặc đưa lời khuyên cụ thể.
  - Ví dụ: khi được hỏi về thời tiết, bạn có thể nói: "Tôi không có dữ liệu thời tiết hiện tại, nhưng bạn có thể kiểm tra trên ứng dụng dự báo."
  - Nếu không biết, hãy lịch sự từ chối.

---

🗣 **PHONG CÁCH TRẢ LỜI**:
- Dùng **tiếng Việt dễ hiểu**, lịch sự, thân thiện.
- Trình bày rõ bằng Markdown:
  - Gạch đầu dòng: \`- Ví dụ\`
  - In đậm: \`**Lưu ý**\`
  - Xuống dòng: \\n\\n

---

🔍 **VÍ DỤ**:

- "Tôi bị sốt nhẹ và đau họng." → ✅ Gợi ý sơ bộ + khuyên khám bác sĩ.
- "Tôi đang uống thuốc Amlodipine, thuốc đó để làm gì?" → ✅ Giải thích công dụng.
- "Lịch hẹn của tôi với bác sĩ Trần Minh là khi nào?" → ✅ Phản hồi rõ ngày giờ.
- "Bạn biết tỷ số bóng đá hôm qua không?" → ❌ Trả lời chung: "Tôi không có dữ liệu thể thao hiện tại."

---

Nếu không đủ thông tin, hãy hỏi lại bệnh nhân để hỗ trợ chính xác hơn.

${contextualInfo}
`.trim(),
        },
        ...contextMessages,
        { role: 'user', content: dto.message },
      ],
      temperature: 0.6,
      max_tokens: 3000,
    })

    reply = chatResponse.choices[0].message.content ?? 'Xin lỗi, tôi không thể trả lời câu hỏi này.'

    // Guard: không cho trả lời vượt giới hạn
    if (reply.match(/\b(bạn bị|tôi nghĩ bạn mắc|bạn nên uống|bạn có thể dùng)\b/i)) {
      reply =
        'Xin lỗi, tôi không thể đưa ra chẩn đoán hay kê đơn. Vui lòng gặp bác sĩ để được tư vấn cụ thể.'
    }

    const usage = chatResponse.usage
    if (usage) {
      this.logger.log(
        `GPT token usage: input ${usage.prompt_tokens}, output ${usage.completion_tokens}, total ${usage.total_tokens}`,
      )
    }

    convo.messages.push({ role: 'assistant', content: reply })
    await convo.save()

    return { reply, messages: convo.messages as ChatMessage[] }
  }
}
