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
import { ChatJsonResponseDto, SendJsonMessageDto } from './dto/chat-json-response.dto'
import {
  ConversationResponseDto,
  GetConversationsResponseDto,
  PaginationDto,
} from './dto/conversation-response.dto'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { GetConversationsDto } from './dto/get-conversations.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { UpdateConversationDto } from './dto/update-conversation.dto'
import { ChatConversation, ChatMessage } from './schemas/chat-conversation.schema'
import { getEmbedding } from './utils/embedding.util'
import { getTopKSimilarMessages } from './utils/similarity.util'

const IMAGE_URL_REGEX = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg|bmp|tiff|tif|ico|heic|avif))/i

// Specialty mapping for normalization and related specialties
const SPECIALTY_ALIASES: Record<string, string> = {
  'nội khoa': 'nội khoa',
  nội: 'nội khoa',
  'tim mạch': 'tim mạch',
  tim: 'tim mạch',
  'thần kinh': 'thần kinh',
  'thần kinh học': 'thần kinh',
  'tiêu hóa': 'tiêu hóa',
  'tiêu hóa gan mật': 'tiêu hóa',
  'hô hấp': 'hô hấp',
  phổi: 'hô hấp',
  'nhi khoa': 'nhi khoa',
  nhi: 'nhi khoa',
  'sản phụ khoa': 'sản phụ khoa',
  sản: 'sản phụ khoa',
  'phụ khoa': 'sản phụ khoa',
  'da liễu': 'da liễu',
  da: 'da liễu',
  mắt: 'mắt',
  'nhãn khoa': 'mắt',
  'tai mũi họng': 'tai mũi họng',
  tmh: 'tai mũi họng',
  'cơ xương khớp': 'cơ xương khớp',
  'xương khớp': 'cơ xương khớp',
  'tâm thần': 'tâm thần học',
  'tâm thần học': 'tâm thần học',
  'tâm lý': 'tâm thần học',
  'ung bướu': 'ung bướu',
  'ung thư': 'ung bướu',
  'nội tiết': 'nội tiết',
  'tiểu đường': 'nội tiết',
}

const RELATED_SPECIALTIES: Record<string, string[]> = {
  'nội khoa': ['tim mạch', 'nội tiết', 'tiêu hóa', 'hô hấp'],
  'tim mạch': ['nội khoa', 'nội tiết'],
  'thần kinh': ['nội khoa', 'tâm thần học'],
  'tiêu hóa': ['nội khoa', 'ung bướu'],
  'hô hấp': ['nội khoa', 'ung bướu'],
  'nhi khoa': ['nội khoa', 'sản phụ khoa'],
  'sản phụ khoa': ['nhi khoa', 'nội tiết'],
  'da liễu': ['nội khoa', 'ung bướu'],
  mắt: ['thần kinh', 'nội tiết'],
  'tai mũi họng': ['nội khoa', 'ung bướu'],
  'cơ xương khớp': ['nội khoa', 'thần kinh'],
  'tâm thần học': ['thần kinh', 'nội khoa'],
  'ung bướu': ['nội khoa', 'tiêu hóa', 'hô hấp', 'da liễu'],
  'nội tiết': ['nội khoa', 'tim mạch', 'sản phụ khoa'],
}

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
      baseURL: 'https://gpt1.shupremium.com/v1',
    })
  }

  async switchModel(conversationId: string, model: string): Promise<ChatConversation> {
    const convo = await this.chatModel.findById(conversationId)
    if (!convo) throw new NotFoundException('Cuộc hội thoại không tồn tại')
    convo.model_used = model
    await convo.save()
    return convo
  }

  async createConversation(dto: CreateConversationDto): Promise<ChatConversation> {
    const modelUsed = dto.model_used || 'gpt-3.5-turbo'
    const conversation = new this.chatModel({
      user_id: dto.user_id,
      messages: [],
      model_used: modelUsed,
      context: dto.context || {},
      title: this.generateTitle('ai', modelUsed),
      type: 'ai',
      unread_count: 0,
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

    // Allow switching model per message if provided
    if (dto.model && dto.model !== convo.model_used) {
      convo.model_used = dto.model
      await convo.save()
    }
    const selectedModel = convo.model_used || 'gpt-3.5-turbo'

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
    const rawMessage = dto.message ?? ''
    let textContent = rawMessage
    let match
    const regex = new RegExp(IMAGE_URL_REGEX, 'gi')
    while ((match = regex.exec(rawMessage)) !== null) {
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

        // For vision, prefer a vision-capable model. If client explicitly requests a model, use it; otherwise default to gpt-4o
        const visionResponse = await this.openai.chat.completions.create({
          model: dto.model || 'gpt-4o',
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
      convo.last_message = reply
      convo.unread_count = (convo.unread_count || 0) + 1
      await convo.save()
      return { reply, messages: convo.messages as ChatMessage[] }
    }

    convo.messages.push({ role: 'user', content: rawMessage })

    const queryEmbedding = await getEmbedding(rawMessage, this.configService)
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
      model: selectedModel,
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

    let rawReply =
      chatResponse.choices[0].message.content ?? 'Xin lỗi, tôi không thể trả lời câu hỏi này.'

    // Ensure reply is always a clean string
    reply = rawReply

    // Final safety check: ensure reply is always a string
    if (typeof reply !== 'string') {
      reply = String(reply)
    }

    // If reply is empty, provide a default response
    if (!reply || reply.trim() === '') {
      reply = 'Tôi đã xử lý yêu cầu của bạn. Vui lòng cho tôi biết nếu bạn cần hỗ trợ thêm.'
    }

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
    convo.last_message = reply
    convo.unread_count = (convo.unread_count || 0) + 1
    await convo.save()

    return { reply, messages: convo.messages as ChatMessage[] }
  }

  // Sidebar API Methods
  async getConversations(dto: GetConversationsDto): Promise<GetConversationsResponseDto> {
    const { user_id, page = 1, limit = 20, type, search } = dto

    // Build query
    const query: Record<string, unknown> = {}
    if (user_id) query.user_id = user_id
    if (type) query.type = type
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { last_message: { $regex: search, $options: 'i' } },
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await this.chatModel.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Fetch conversations
    const conversations = await this.chatModel
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Transform to response format
    const data: ConversationResponseDto[] = conversations.map(conv => ({
      id: conv._id.toString(),
      title: conv.title || this.generateTitle(conv.type, conv.model_used),
      lastMessage: conv.last_message || '',
      updatedAt: (conv as Record<string, unknown>).updatedAt as string,
      unread: conv.unread_count > 0,
      model_used: conv.model_used || 'gpt-3.5-turbo',
      type: conv.type || 'ai',
      avatar: this.getAvatarUrl(conv.type),
      participantCount: conv.type === 'doctor' ? 2 : 1,
    }))

    const pagination: PaginationDto = {
      page,
      limit,
      total,
      totalPages,
    }

    return {
      success: true,
      data,
      pagination,
    }
  }

  async markConversationAsRead(
    conversationId: string,
  ): Promise<{ success: boolean; message: string }> {
    const conversation = await this.chatModel.findById(conversationId)
    if (!conversation) {
      throw new NotFoundException('Conversation not found')
    }

    conversation.unread_count = 0
    await conversation.save()

    return {
      success: true,
      message: 'Conversation marked as read',
    }
  }

  async deleteConversation(conversationId: string): Promise<{ success: boolean; message: string }> {
    const conversation = await this.chatModel.findById(conversationId)
    if (!conversation) {
      throw new NotFoundException('Conversation not found')
    }

    await this.chatModel.findByIdAndDelete(conversationId)

    return {
      success: true,
      message: 'Conversation deleted successfully',
    }
  }

  async updateConversation(
    conversationId: string,
    dto: UpdateConversationDto,
  ): Promise<ChatConversation> {
    const conversation = await this.chatModel.findById(conversationId)
    if (!conversation) {
      throw new NotFoundException('Conversation not found')
    }

    if (dto.title) conversation.title = dto.title
    if (dto.type) conversation.type = dto.type
    if (dto.model_used) conversation.model_used = dto.model_used

    await conversation.save()
    return conversation
  }

  // Helper methods
  private generateTitle(type: string, modelUsed?: string): string {
    if (type === 'doctor') {
      return 'Bác sĩ'
    }

    if (type === 'ai') {
      const modelLabels: Record<string, string> = {
        'gpt-4o': 'GPT-4o',
        'gpt-4o-mini': 'GPT-4o Mini',
        'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      }
      return `AI - ${modelLabels[modelUsed || 'gpt-3.5-turbo'] || modelUsed || 'GPT-3.5 Turbo'}`
    }

    return 'Cuộc trò chuyện mới'
  }

  private getAvatarUrl(type: string): string {
    if (type === 'doctor') {
      return 'https://example.com/doctor-avatar.jpg'
    }

    if (type === 'ai') {
      return 'https://example.com/ai-avatar.png'
    }

    return 'https://example.com/default-avatar.png'
  }

  // JSON Response API Method
  async sendJsonMessage(
    conversationId: string,
    dto: SendJsonMessageDto,
  ): Promise<ChatJsonResponseDto> {
    const convo = await this.chatModel.findById(conversationId)
    if (!convo) throw new NotFoundException('Cuộc hội thoại không tồn tại')

    // Allow switching model per message if provided
    if (dto.model && dto.model !== convo.model_used) {
      convo.model_used = dto.model
      await convo.save()
    }
    const selectedModel = convo.model_used || 'gpt-3.5-turbo'

    // Get patient info and appointments
    let patientInfo: Patient | null = null
    let appointments: Appointment[] = []

    if (convo.user_id) {
      try {
        patientInfo = await this.usersService.getPatientById(convo.user_id)
      } catch (err) {
        this.logger.warn('Không lấy được thông tin bệnh nhân', err)
      }

      try {
        const jwtPayload: JwtPayload = {
          userId: convo.user_id,
          username: patientInfo?.username || '',
          role: 'PATIENT',
        }
        const appointmentsResult = await this.appointmentService.findAppointments(jwtPayload)
        appointments = appointmentsResult.data || []
      } catch (err) {
        this.logger.warn('Không lấy được lịch hẹn', err)
      }
    }

    // Build context messages
    const contextMessages: ChatMessage[] = []
    if (convo.messages.length > 0) {
      contextMessages.push(...convo.messages.slice(-10)) // Last 10 messages
    }

    // Add user message
    convo.messages.push({
      role: 'user',
      content: dto.message,
      imageUrls: dto.imageUrls || [],
    })

    // Build contextual info
    const contextualInfo = patientInfo
      ? `
**Thông tin bệnh nhân:**
- Họ và tên: ${(patientInfo as any).name || 'Chưa cập nhật'}
- Tuổi: ${(patientInfo as any).age || 'Chưa cập nhật'}
- Giới tính: ${patientInfo.gender || 'Chưa cập nhật'}
- Số điện thoại: ${(patientInfo as any).phone || 'Chưa cập nhật'}
`
      : ''

    const appointmentInfo =
      appointments.length > 0
        ? `
**Lịch hẹn gần đây:**
${appointments
  .slice(0, 3)
  .map(apt => `- Ngày: ${apt.date}, Giờ: ${apt.slot}, Trạng thái: ${apt.status}`)
  .join('\n')}
`
        : ''

    // Create system prompt for JSON response
    const systemPrompt = `
Bạn là trợ lý AI TalkToDoc, hỗ trợ tư vấn sức khỏe và cung cấp thông tin cá nhân hóa.

**QUAN TRỌNG**: 
- Bạn chỉ trả lời bằng TEXT thuần túy, KHÔNG bao giờ trả về JSON hoặc object
- Luôn trả lời bằng tiếng Việt, rõ ràng và dễ hiểu
- Không đưa ra chẩn đoán y tế cụ thể
- Gợi ý gặp bác sĩ khi cần thiết

**QUY TẮC TRẢ LỜI**:
- Trả lời ngắn gọn, súc tích
- Sử dụng ngôn ngữ thân thiện, dễ hiểu
- Không sử dụng ký hiệu đặc biệt hoặc format JSON
- Chỉ trả về câu trả lời text thuần túy

${contextualInfo}
${appointmentInfo}
`.trim()

    const chatResponse = await this.openai.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...contextMessages,
        { role: 'user', content: dto.message },
      ],
      temperature: 0.6,
      max_tokens: 3000,
    })

    let rawReply =
      chatResponse.choices[0].message.content ?? 'Xin lỗi, tôi không thể trả lời câu hỏi này.'

    // Ensure reply is always a clean string (remove any JSON if AI returns it)
    let reply = rawReply
    let jsonData: { type: string; data: Record<string, unknown> } | undefined

    if (dto.requireJsonResponse || dto.jsonResponseType) {
      // Look for JSON in the response and extract it
      const jsonMatch = reply.match(/```json\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch) {
        try {
          const parsedJson = JSON.parse(jsonMatch[1])
          jsonData = {
            type: parsedJson.type || dto.jsonResponseType || 'general_info',
            data: parsedJson.data || parsedJson,
          }
          // Remove JSON from reply to keep only text
          reply = reply.replace(/```json\s*\{[\s\S]*?\}\s*```/, '').trim()
        } catch (err) {
          this.logger.warn('Không thể parse JSON từ response', err)
        }
      }

      // If no JSON found but type is specified, generate based on type
      if (!jsonData && dto.jsonResponseType) {
        jsonData = await this.generateJsonByType(
          dto.jsonResponseType,
          reply,
          appointments,
          patientInfo,
        )
      }
    }

    // Final safety check: ensure reply is always a string
    if (typeof reply !== 'string') {
      reply = String(reply)
    }
    // If reply is empty after cleaning, provide a default response
    if (!reply || reply.trim() === '') {
      reply = 'Tôi đã xử lý yêu cầu của bạn. Vui lòng cho tôi biết nếu bạn cần hỗ trợ thêm.'
    }

    // Update conversation
    convo.messages.push({ role: 'assistant', content: reply })
    convo.last_message = reply
    convo.unread_count = (convo.unread_count || 0) + 1
    await convo.save()

    const usage = chatResponse.usage
    const response: ChatJsonResponseDto = {
      success: true,
      reply,
      jsonData,
      timestamp: new Date().toISOString(),
      model: selectedModel,
      usage: usage
        ? {
            inputTokens: usage.prompt_tokens,
            outputTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
          }
        : undefined,
    }

    return response
  }

  private async generateJsonByType(
    type: string,
    reply: string,
    appointments: Appointment[],
    patientInfo: Patient | null,
  ): Promise<{ type: string; data: Record<string, unknown> }> {
    switch (type) {
      case 'appointment_info':
        return {
          type: 'appointment_info',
          data: {
            hasAppointment: appointments.length > 0,
            totalAppointments: appointments.length,
            nextAppointment:
              appointments.length > 0
                ? {
                    appointmentId: appointments[0].appointmentId,
                    date: appointments[0].date,
                    slot: appointments[0].slot,
                    status: appointments[0].status,
                    reason: appointments[0].reason,
                    doctor: appointments[0].doctor,
                  }
                : null,
            recentAppointments: appointments.slice(0, 5).map(apt => ({
              appointmentId: apt.appointmentId,
              date: apt.date,
              slot: apt.slot,
              status: apt.status,
              doctor: apt.doctor,
            })),
          },
        }

      case 'appointment_suggestion':
        const symptoms = this.extractSymptoms(reply)
        const recommendedSpecialties =
          symptoms.length > 0 ? this.getRecommendedSpecialties(symptoms) : ['tổng quát']

        // Use new doctor selection system
        const recommendedDoctors = await this.selectDoctorsBySpecialty({
          targetSpecialtyNames: recommendedSpecialties,
          priceTarget: 250000,
          limit: 5,
          // cache: this.cache, // Uncomment if cache is available
          userId: patientInfo?.id,
        })

        // Fallback if no doctors found
        let finalDoctors = recommendedDoctors
        if (finalDoctors.length === 0) {
          // Try related specialties
          const relatedSpecs = recommendedSpecialties.flatMap(
            spec => RELATED_SPECIALTIES[spec] || [],
          )
          if (relatedSpecs.length > 0) {
            finalDoctors = await this.selectDoctorsBySpecialty({
              targetSpecialtyNames: relatedSpecs,
              priceTarget: 250000,
              limit: 5,
              userId: patientInfo?.id,
            })
          }

          // Final fallback to general internal medicine
          if (finalDoctors.length === 0) {
            finalDoctors = await this.selectDoctorsBySpecialty({
              targetSpecialtyNames: ['tổng quát'],
              priceTarget: 250000,
              limit: 3,
              userId: patientInfo?.id,
            })
          }
        }

        return {
          type: 'appointment_suggestion',
          data: {
            suggested: true,
            reason: 'Dựa trên triệu chứng và lịch sử khám bệnh',
            urgency: 'normal',
            recommendedSpecialty: recommendedSpecialties[0] || 'tổng quát',
            recommendedSpecialties: recommendedSpecialties,
            detectedSymptoms: symptoms,
            estimatedWaitTime: '2-3 ngày',
            recommendedDoctors: finalDoctors,
            suggestedTimeSlots: this.generateTimeSlots(),
            pricing: {
              platformFee: 50000,
              doctorFee: 250000,
              discount: 0,
              total: 300000,
              currency: 'VND',
            },
            bookingInfo: {
              minAdvanceBooking: '2 giờ',
              maxAdvanceBooking: '30 ngày',
              cancellationPolicy: 'Hủy miễn phí trước 2 giờ',
              reschedulePolicy: 'Đổi lịch miễn phí trước 4 giờ',
            },
          },
        }

      case 'symptom_analysis':
        const _symptoms = this.extractSymptoms(reply)
        return {
          type: 'symptom_analysis',
          data: {
            symptoms: _symptoms,
            severity: 'mild',
            recommendation: 'Khám bác sĩ để được tư vấn cụ thể',
            suggestedSpecialty:
              _symptoms.length > 0 ? this.getRecommendedSpecialties(_symptoms) : 'tổng quát',
          },
        }

      case 'patient_info':
        return {
          type: 'patient_info',
          data: {
            hasInfo: !!patientInfo,
            name: patientInfo?.fullName || null,
            age: patientInfo?.birthDate || null,
            gender: patientInfo?.gender || null,
            phone: patientInfo?.phoneNumber || null,
          },
        }

      default:
        return {
          type: 'general_info',
          data: {
            message: reply,
            timestamp: new Date().toISOString(),
          },
        }
    }
  }

  private extractSymptoms(text: string): string[] {
    const symptoms: string[] = []
    const symptomKeywords = [
      'đau đầu',
      'sốt',
      'ho',
      'mệt mỏi',
      'đau bụng',
      'khó thở',
      'chóng mặt',
      'buồn nôn',
      'đau ngực',
      'đau lưng',
    ]

    const lowerText = text.toLowerCase()
    symptomKeywords.forEach(symptom => {
      if (lowerText.includes(symptom)) {
        symptoms.push(symptom)
      }
    })

    return symptoms
  }

  private getRecommendedSpecialties(symptoms: string[]): string[] {
    // Mapping symptoms → specialties (cần sync với DB thực tế)
    const symptomSpecialtyMap: Record<string, string[]> = {
      // --- Các triệu chứng phổ biến ---
      'đau đầu': ['nội khoa', 'thần kinh'],
      sốt: ['nội khoa', 'nhi khoa', 'truyền nhiễm'],
      ho: ['hô hấp', 'nội khoa', 'tai mũi họng'],
      'mệt mỏi': ['nội khoa', 'nội tiết'],
      'đau bụng': ['nội khoa', 'tiêu hóa', 'ngoại tổng quát'],
      'khó thở': ['hô hấp', 'tim mạch'],
      'chóng mặt': ['thần kinh', 'nội khoa', 'tai mũi họng'],
      'buồn nôn': ['tiêu hóa', 'nội khoa', 'thần kinh'],
      'đau ngực': ['tim mạch', 'nội khoa', 'hô hấp'],
      'đau lưng': ['cơ xương khớp', 'nội khoa'],

      // --- Hệ tiêu hóa ---
      'tiêu chảy': ['tiêu hóa', 'nội khoa'],
      'táo bón': ['tiêu hóa', 'nội khoa'],
      'đầy bụng': ['tiêu hóa', 'nội khoa'],
      'ợ chua': ['tiêu hóa', 'nội khoa'],
      'xuất huyết tiêu hóa': ['tiêu hóa', 'ngoại tổng quát'],

      // --- Hệ hô hấp ---
      'sổ mũi': ['tai mũi họng', 'hô hấp'],
      'nghẹt mũi': ['tai mũi họng'],
      'đau họng': ['tai mũi họng', 'hô hấp'],
      'khàn tiếng': ['tai mũi họng'],
      'thở khò khè': ['hô hấp', 'nhi khoa'],

      // --- Hệ thần kinh & tâm thần ---
      'mất ngủ': ['tâm thần', 'thần kinh'],
      'lo âu': ['tâm thần'],
      'trầm cảm': ['tâm thần'],
      'run tay chân': ['thần kinh'],
      'co giật': ['thần kinh', 'nhi khoa'],

      // --- Hệ cơ xương khớp ---
      'đau khớp': ['cơ xương khớp'],
      'sưng khớp': ['cơ xương khớp'],
      'chuột rút': ['cơ xương khớp', 'nội khoa'],

      // --- Hệ tim mạch ---
      'huyết áp cao': ['tim mạch'],
      'huyết áp thấp': ['tim mạch'],
      'đánh trống ngực': ['tim mạch'],

      // --- Da liễu ---
      ngứa: ['da liễu'],
      'phát ban': ['da liễu', 'dị ứng miễn dịch'],
      mụn: ['da liễu'],
      'rụng tóc': ['da liễu'],
      'viêm da': ['da liễu'],

      // --- Sản phụ khoa ---
      'trễ kinh': ['sản phụ khoa'],
      'đau bụng kinh': ['sản phụ khoa'],
      'ra khí hư': ['sản phụ khoa'],
      'ra máu bất thường': ['sản phụ khoa'],

      // --- Nhi khoa ---
      'quấy khóc': ['nhi khoa'],
      'biếng ăn': ['nhi khoa'],
      'chậm phát triển': ['nhi khoa'],

      // --- Mắt & Tai ---
      'mờ mắt': ['mắt'],
      'đau mắt': ['mắt'],
      'ngứa mắt': ['mắt'],
      'chảy nước mắt': ['mắt'],
      'ù tai': ['tai mũi họng'],
      'điếc đột ngột': ['tai mũi họng'],

      // --- Tiết niệu ---
      'tiểu buốt': ['tiết niệu'],
      'tiểu nhiều': ['tiết niệu', 'nội tiết'],
      'tiểu ra máu': ['tiết niệu'],
    }

    const recommendedSpecialties: string[] = []

    symptoms.forEach(symptom => {
      const specialties = symptomSpecialtyMap[symptom.toLowerCase()]
      if (specialties) {
        recommendedSpecialties.push(...specialties)
      }
    })

    return [...new Set(recommendedSpecialties)]
  }

  private async getAvailableDoctors(symptoms?: string[]): Promise<any[]> {
    try {
      // Lấy danh sách bác sĩ có sẵn
      const doctors = await this.usersService.getAllDoctors()

      // Lấy thông tin specialty để populate
      const specialties = await this.specialtyService.getAllSpecialties()
      const specialtyMap = new Map(specialties.map(s => [s.id.toString(), s]))
      // Filter doctors theo chuyên khoa phù hợp nếu có symptoms
      let filteredDoctors = doctors
      if (symptoms && symptoms.length > 0) {
        const recommendedSpecialties = this.getRecommendedSpecialties(symptoms)
        filteredDoctors = doctors.filter((doctor: any) =>
          doctor.specialty.some((specId: any) => {
            const specialty = specialtyMap.get(specId.toString())
            return specialty && recommendedSpecialties.includes(specialty.name.toLowerCase())
          }),
        )
      }

      // Limit to 5 doctors
      filteredDoctors = filteredDoctors.slice(0, 5)

      return filteredDoctors.map((doctor: any) => ({
        id: doctor._id,
        doctorId: doctor.id, // DRxxxxxx
        name: doctor.fullName,
        specialty: doctor.specialty.map((specId: any) => {
          const specialty = specialtyMap.get(specId.toString())
          return specialty
            ? {
                id: specialty.id,
                name: specialty.name,
                description: specialty.description,
              }
            : { id: specId, name: 'Unknown', description: '' }
        }),
        experienceYears: doctor.experienceYears,
        rating: doctor.avgScore,
        availability: doctor.availability,
        position: doctor.position,
        hospital: doctor.hospital,
        nextAvailableSlot: this.getNextAvailableSlot(doctor.availability),
      }))
    } catch (error) {
      this.logger.warn('Không thể lấy danh sách bác sĩ', error)
      return []
    }
  }

  private generateTimeSlots(): any[] {
    const today = new Date()
    const timeSlots: any[] = []

    // Tạo time slots cho 7 ngày tới
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      const dateStr = date.toISOString().split('T')[0]
      const daySlots = this.getDayTimeSlots(dateStr)

      if (daySlots.length > 0) {
        timeSlots.push({
          date: dateStr,
          dayOfWeek: this.getDayOfWeek(date.getDay()),
          slots: daySlots,
        })
      }
    }

    return timeSlots
  }

  private getDayTimeSlots(_date: string): any[] {
    // Tạo các khung giờ phù hợp (8:00-17:00)
    const slots: any[] = []
    const startHour = 8
    const endHour = 17

    for (let hour = startHour; hour < endHour; hour++) {
      const timeStart = `${hour.toString().padStart(2, '0')}:00`
      const timeEnd = `${(hour + 1).toString().padStart(2, '0')}:00`

      slots.push({
        time: `${timeStart}-${timeEnd}`,
        timeStart,
        timeEnd,
        available: Math.random() > 0.3, // 70% chance available
        price: this.calculateSlotPrice(hour),
      })
    }

    return slots.filter(slot => slot.available)
  }

  private getNextAvailableSlot(availability: any[]): string | null {
    if (!availability || availability.length === 0) return null

    // Tìm slot gần nhất có sẵn
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    return `${tomorrow.toISOString().split('T')[0]} 09:00-10:00`
  }

  private getDayOfWeek(dayIndex: number): string {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
    return days[dayIndex]
  }

  private calculateSlotPrice(hour: number): number {
    // Giá khác nhau theo giờ
    if (hour >= 8 && hour < 12) return 250000 // Sáng
    if (hour >= 12 && hour < 14) return 200000 // Trưa (giảm giá)
    if (hour >= 14 && hour < 17) return 300000 // Chiều (cao hơn)
    return 250000 // Mặc định
  }

  /**
   * Normalize specialty name to standard key
   */
  private normSpec(name: string): string {
    const normalized = name.toLowerCase().trim()
    return SPECIALTY_ALIASES[normalized] || normalized
  }

  /**
   * Enumerate next available slots for a doctor
   */
  private enumerateNextSlots(
    availability: any[],
    daysAhead: number = 14,
  ): Array<{ start: string; end: string }> {
    const slots: Array<{ start: string; end: string }> = []
    const now = new Date()

    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      // Mock availability - in real implementation, check doctor's actual availability
      const daySlots = this.getDayTimeSlots(dateStr)
      daySlots.forEach(slot => {
        if (slot.available) {
          slots.push({
            start: `${dateStr}T${slot.timeStart}:00`,
            end: `${dateStr}T${slot.timeEnd}:00`,
          })
        }
      })
    }

    return slots
  }

  /**
   * Calculate availability soon score based on slots
   */
  private availabilitySoonScore(slots: Array<{ start: string; end: string }>): number {
    if (slots.length === 0) return 0

    const now = new Date()
    const hours48 = 48 * 60 * 60 * 1000
    const hours168 = 168 * 60 * 60 * 1000 // 7 days
    const hours336 = 336 * 60 * 60 * 1000 // 14 days

    for (const slot of slots) {
      const slotTime = new Date(slot.start).getTime()
      const diff = slotTime - now.getTime()

      if (diff <= hours48) return 1.0
      if (diff <= hours168) return 0.7
      if (diff <= hours336) return 0.3
    }

    return 0.1
  }

  /**
   * Guess doctor price (placeholder implementation)
   */
  private guessDoctorPrice(_doctor: any): number | undefined {
    // Placeholder - in real implementation, get from doctor's pricing data
    return undefined
  }

  private computeSpecialtyFit(
    doctorSpecialtiesNorm: string[],
    targetNorms: string[],
  ): {
    fit: number
    matchType: 'exact' | 'partial' | 'related' | 'general' | 'loose' | 'none'
  } {
    // Không có chuyên khoa -> vẫn cho điểm nền để không bị loại
    if (!doctorSpecialtiesNorm || doctorSpecialtiesNorm.length === 0) {
      return { fit: 0.3, matchType: 'none' }
    }

    // 1) Exact
    if (doctorSpecialtiesNorm.some(spec => targetNorms.includes(spec))) {
      return { fit: 1.0, matchType: 'exact' }
    }

    // 2) Partial (bao hàm từ khóa 2 chiều)
    const partialHit = doctorSpecialtiesNorm.some(spec =>
      targetNorms.some(t => spec.includes(t) || t.includes(spec)),
    )
    if (partialHit) {
      return { fit: 0.85, matchType: 'partial' }
    }

    // 3) Related (nếu có bảng liên quan)
    const relatedSpecs = targetNorms.flatMap(t => RELATED_SPECIALTIES?.[t] || [])
    if (
      relatedSpecs.length > 0 &&
      doctorSpecialtiesNorm.some(spec => relatedSpecs.includes(spec))
    ) {
      return { fit: 0.7, matchType: 'related' }
    }

    // 4) General (nội khoa / tổng quát)
    if (doctorSpecialtiesNorm.includes('nội khoa') || doctorSpecialtiesNorm.includes('tổng quát')) {
      return { fit: 0.55, matchType: 'general' }
    }

    // 5) Không khớp rõ ràng -> điểm nền "loose" (không loại)
    return { fit: 0.35, matchType: 'loose' }
  }
  /**
   * Select doctors by specialty with optimized scoring and better matching
   */
  private async selectDoctorsBySpecialty(opts: {
    targetSpecialtyNames: string[]
    priceTarget?: number
    limit?: number
    cache?: {
      get: (k: string) => Promise<any>
      set: (k: string, v: any, ttl: number) => Promise<any>
    }
    userId?: string
  }): Promise<any[]> {
    const { targetSpecialtyNames, priceTarget = 250000, limit = 5, cache, userId } = opts

    // Normalize target specialties
    const targetNorms = targetSpecialtyNames.map(name => this.normSpec(name))
    const cacheKey = `doc_suggest:${targetNorms.join(',')}:${priceTarget}`

    this.logger.log('Doctor selection params:', {
      targetSpecialtyNames,
      targetNorms,
      priceTarget,
      limit,
      userId,
    })

    // Check cache first
    if (cache) {
      try {
        const cached = await cache.get(cacheKey)
        if (cached) {
          this.logger.log('Using cached doctor suggestions')
          return cached
        }
      } catch (err) {
        this.logger.warn('Cache get failed', err)
      }
    }

    try {
      // Get all doctors and specialties
      const doctors = await this.usersService.getAllDoctors()
      const specialties = await this.specialtyService.getAllSpecialties()

      this.logger.log(`Found ${doctors.length} doctors and ${specialties.length} specialties`)

      const specMap = new Map(
        specialties.map((s: any) => [
          s.id.toString(),
          { id: s.id, name: s.name, norm: this.normSpec(s.name) },
        ]),
      )

      // Filter active and approved doctors (nếu có field; hiện giữ nguyên)
      const activeDoctors = doctors
      this.logger.log(`Active doctors: ${activeDoctors.length}`)

      if (activeDoctors.length === 0) {
        this.logger.warn('No active doctors found')
        return []
      }

      // Calculate scores for each doctor (chuyên khoa match lenient)
      const scoredDoctors = activeDoctors
        .map((doctor: any) => {
          try {
            // Specialty normalization cho bác sĩ
            const doctorSpecialties = (doctor.specialty || [])
              .map((specId: any) => {
                const spec = specMap.get(specId.toString())
                return spec ? spec.norm : null
              })
              .filter(Boolean) as string[]

            // Điểm chuyên khoa mềm (không loại)
            const { fit: specialtyFit, matchType: specialtyMatchType } = this.computeSpecialtyFit(
              doctorSpecialties,
              targetNorms,
            )

            // Availability
            const slots = this.enumerateNextSlots(doctor.availability || [], 14)
            const availabilitySoon = this.availabilitySoonScore(slots)

            // Rating
            const rating = doctor.avgScore || 0
            const ratingNorm = Math.min(rating, 5) / 5

            // Experience
            const experienceYears = doctor.experienceYears || 0
            let experienceNorm = 0
            if (experienceYears >= 10) experienceNorm = 1.0
            else if (experienceYears >= 5) experienceNorm = 0.8
            else if (experienceYears >= 2) experienceNorm = 0.6
            else if (experienceYears >= 1) experienceNorm = 0.4
            else experienceNorm = 0.2

            // Performance
            const performanceScore = doctor.performanceScore || 0
            const performanceNorm = Math.min(performanceScore, 10) / 10

            // Price affinity
            const doctorPrice = this.guessDoctorPrice(doctor) || priceTarget
            const priceDiff = Math.abs(doctorPrice - priceTarget)
            const priceAffinity = priceDiff === 0 ? 1.0 : 1 / (1 + priceDiff / 100000)

            // Popularity
            const ratingCount = doctor.ratingDetailsCount || 0
            const popularityNorm = Math.min(1, ratingCount / 10)

            // Location bonus
            let locationBonus = 0
            if (doctor.location && doctor.location.city) {
              locationBonus = 0.02
            }

            // Score tổng (hạ nhẹ trọng số chuyên khoa để cân bằng)
            let score =
              0.35 * specialtyFit + // mềm hơn, để yếu tố khác kéo lên
              0.25 * availabilitySoon +
              0.15 * ratingNorm +
              0.1 * experienceNorm +
              0.05 * performanceNorm +
              0.03 * priceAffinity +
              0.02 * popularityNorm +
              locationBonus

            // Personalization bonus
            if (userId && doctor.patientHistory && doctor.patientHistory[userId]) {
              const history = doctor.patientHistory[userId]
              if (history?.rating >= 4) {
                score += 0.05
              }
            }

            // Next slot format
            const nextSlot = slots.length > 0 ? slots[0] : null
            const nextAvailableSlot = nextSlot
              ? `${nextSlot.start.split('T')[0]} ${nextSlot.start.split('T')[1].substring(0, 5)}-${nextSlot.end.split('T')[1].substring(0, 5)}`
              : null

            return {
              doctor,
              score: Math.round(score * 1000) / 1000,
              nextAvailableSlot,
              hospitalName: doctor.hospital?.name || doctor.hospital || 'Chưa xác định',
              specialtyMatchType,
              rating,
              experienceYears,
              availabilityCount: slots.length,
            }
          } catch (err) {
            this.logger.warn(`Error processing doctor ${doctor?.id}:`, err)
            return null
          }
        })
        .filter(Boolean) as Array<{
        doctor: any
        score: number
        nextAvailableSlot: string | null
        hospitalName: string
        specialtyMatchType: 'exact' | 'partial' | 'related' | 'general' | 'loose' | 'none'
        rating: number
        experienceYears: number
        availabilityCount: number
      }>

      this.logger.log(`Scored doctors: ${scoredDoctors.length}`)

      if (scoredDoctors.length === 0) {
        this.logger.warn('No doctors passed scoring')
        return []
      }

      // Sort by score desc
      scoredDoctors.sort((a, b) => (b?.score || 0) - (a?.score || 0))

      // Diversification
      const diversified: any[] = []
      const hospitalCount: Record<string, number> = {}
      const specialtyCount: Record<string, number> = {}

      // First pass: ưu tiên exact + high score
      for (const item of scoredDoctors) {
        if (!item) continue
        if (diversified.length >= limit) break

        const hospital = item.hospitalName
        const specialty = item.specialtyMatchType
        const currentHospitalCount = hospitalCount[hospital] || 0
        const currentSpecialtyCount = specialtyCount[specialty] || 0

        // Cho phép nhiều hơn nếu exact
        const maxPerHospital = item.specialtyMatchType === 'exact' ? 3 : 2
        const maxPerSpecialty = 2

        if (currentHospitalCount < maxPerHospital && currentSpecialtyCount < maxPerSpecialty) {
          diversified.push(item)
          hospitalCount[hospital] = currentHospitalCount + 1
          specialtyCount[specialty] = currentSpecialtyCount + 1
        }
      }

      // Second pass: fill remaining slots
      if (diversified.length < limit) {
        for (const item of scoredDoctors) {
          if (diversified.length >= limit) break
          if (item && !diversified.includes(item)) {
            diversified.push(item)
          }
        }
      }

      this.logger.log(`Final diversified doctors: ${diversified.length}`)

      // Format output
      const result = diversified.map(item => {
        const d = item.doctor
        const specs = (d.specialty || []).map((specId: any) => {
          const spec = specMap.get(specId.toString())
          return spec ? { id: spec.id, name: spec.name } : { id: specId, name: 'Unknown' }
        })

        return {
          id: d._id,
          doctorId: d.id,
          name: d.fullName,
          specialty: specs,
          experienceYears: d.experienceYears,
          rating: d.avgScore,
          position: d.position,
          hospital: item.hospitalName,
          nextAvailableSlot: item.nextAvailableSlot,
          score: item.score,
          specialtyMatchType: item.specialtyMatchType,
          availabilityCount: item.availabilityCount,
        }
      })

      // Cache 10 phút
      if (cache) {
        try {
          await cache.set(cacheKey, result, 600)
        } catch (err) {
          this.logger.warn('Cache set failed', err)
        }
      }

      this.logger.log(`Returning ${result.length} doctors`)
      return result
    } catch (error) {
      this.logger.error('Error selecting doctors by specialty', error)
      return []
    }
  }
}
