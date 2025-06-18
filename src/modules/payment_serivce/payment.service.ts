import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import * as crypto from 'crypto'
import moment from 'moment'
import { Model, Types } from 'mongoose'
import * as querystring from 'qs'
import { AppointmentService } from '../appointments_service/appointment.service'
import { UsersService } from '../user-service/user.service'
import { PaySalaryDto } from './dto/pay-salary.dto'
import { PaymentCallbackDto } from './dto/payment-callback.dto'
import { PaymentRequestDto } from './dto/payment-request.dto'
import {
  PaymentUrlResponse,
  PaymentVerificationResponse,
  VnpayParams,
} from './interfaces/payment.interface'
import { OrderMapping } from './schemas/order-mapping.schema'

// Định nghĩa type cho appointment đã populate
interface AppointmentPopulated {
  doctor: string | Types.ObjectId
  // ... các trường khác nếu cần
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name)

  private readonly vnp_TmnCode: string
  private readonly vnp_HashSecret: string
  private readonly vnp_Url: string
  private readonly urlCallBack: string

  constructor(
    @InjectModel(OrderMapping.name)
    private orderMappingModel: Model<OrderMapping>,
    private configService: ConfigService,
    private usersService: UsersService,
    private appointmentService: AppointmentService,
  ) {
    this.vnp_TmnCode = this.configService.get<string>('VNP_TMN_CODE') || 'BAXGHO1O'
    this.vnp_HashSecret =
      this.configService.get<string>('VNP_HASH_SECRET') || 'W6AXF4895PIAWHEKVS7KAZ8QTX6DPXR3'
    this.vnp_Url =
      this.configService.get<string>('VNP_URL') ||
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
    this.urlCallBack =
      this.configService.get<string>('VNP_CALLBACK_URL') ||
      'http://dashboard.talktodoc.online/payment'
  }

  async createPaymentUrl(request: PaymentRequestDto): Promise<PaymentUrlResponse> {
    process.env.TZ = 'Asia/Ho_Chi_Minh'
    const date = new Date()
    const createDate = moment(date).format('YYYYMMDDHHmmss')
    // const randomNum = Math.floor(Math.random() * 1000)
    //   .toString()
    //   .padStart(3, '0')
    // const orderId = moment(date).format('DDHHmmss') + randomNum

    let orderId = ''
    let isUnique = false
    while (!isUnique) {
      const randomNum = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')
      orderId = `OD-${randomNum}`
      const existing = await this.orderMappingModel.exists({ orderId })
      if (!existing) {
        isUnique = true
      }
    }

    this.logger.log(`Generated orderId: ${orderId}`)

    try {
      await this.storeOrderUserMapping(
        orderId,
        request.patient,
        request.amount,
        request.appointmentId,
      )

      let vnp_Params: VnpayParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: 'Thanh toan Premium: ' + orderId,
        vnp_OrderType: 'billpayment',
        vnp_Amount: request.amount * 100,
        vnp_ReturnUrl: this.urlCallBack,
        vnp_IpAddr: '127.0.0.1',
        vnp_CreateDate: createDate,
      }

      vnp_Params = this.sortObject(vnp_Params)
      const signData = querystring.stringify(vnp_Params, { encode: false })

      if (!this.vnp_HashSecret) {
        throw new Error('VNP_HASH_SECRET is undefined')
      }

      const hmac = crypto.createHmac('sha512', this.vnp_HashSecret)
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
      vnp_Params['vnp_SecureHash'] = signed

      const vnpUrl = this.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false })
      return { paymentUrl: vnpUrl }
    } catch (error: unknown) {
      this.logger.error(
        `Error creating payment URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      )
      throw error
    }
  }

  async processSimpleCallback(
    callbackData: PaymentCallbackDto,
  ): Promise<PaymentVerificationResponse> {
    try {
      if (callbackData.vnp_ResponseCode === '00') {
        const orderId = callbackData.vnp_TxnRef
        const orderMapping = await this.getOrderMapping(orderId)

        if (orderMapping) {
          await this.updateOrderStatus(orderId, 'completed')
          return {
            success: true,
            message: 'Payment successful, order marked as completed',
            orderId,
            patient: orderMapping.patient,
          }
        } else {
          return {
            success: false,
            message: 'Order not found',
            orderId,
          }
        }
      } else {
        return {
          success: false,
          message: `Payment failed: ${callbackData.vnp_ResponseCode}`,
          orderId: callbackData.vnp_TxnRef,
        }
      }
    } catch (error) {
      this.logger.error('Payment verification error:', error)
      return {
        success: false,
        message: 'Payment verification error',
      }
    }
  }

  async storeOrderUserMapping(
    orderId: string,
    patient: string,
    amount: number,
    appointmentId?: string,
  ): Promise<OrderMapping> {
    try {
      return this.orderMappingModel.create({
        orderId,
        patient,
        appointmentId,
        amount,
        status: 'completed',
        createdAt: new Date(),
      })
    } catch (error: unknown) {
      this.logger.error(
        `Error storing order mapping: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      )
      throw error
    }
  }

  async getOrderMapping(orderId: string): Promise<OrderMapping> {
    const result = await this.orderMappingModel.findOne({ orderId }).exec()
    if (!result) {
      throw new Error(`Order mapping not found for orderId: ${orderId}`)
    }
    return result
  }

  async updateOrderStatus(orderId: string, status: string): Promise<OrderMapping> {
    const result = await this.orderMappingModel
      .findOneAndUpdate(
        { orderId },
        {
          status,
          completedAt: status === 'completed' ? new Date() : undefined,
        },
        { new: true },
      )
      .exec()
    if (!result) {
      throw new Error(`Order not found for orderId: ${orderId}`)
    }
    return result
  }

  sortObject(obj: Record<string, string | number>): Record<string, string> {
    const sorted: Record<string, string> = {}
    const keys = Object.keys(obj).sort()
    for (const key of keys) {
      sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, '+')
    }
    return sorted
  }

  async getSimplifiedPaymentHistory(patient: string): Promise<
    {
      orderId: string
      amount: number
      status: string
      createdAt: Date
      completedAt?: Date
      user: { name: string; email: string }
    }[]
  > {
    const payments = await this.orderMappingModel
      .find({ patient })
      .sort({ createdAt: 1 })
      .lean()
      .exec()
    const userInfo = await this.usersService.findOneUser(patient)

    let name = 'Unknown'
    let email = 'Unknown'

    if (userInfo && typeof userInfo === 'object') {
      if ('name' in userInfo && typeof userInfo.name === 'string') {
        name = userInfo.name
      } else if ('fullName' in userInfo && typeof userInfo.fullName === 'string') {
        name = userInfo.fullName
      }

      if ('email' in userInfo && typeof userInfo.email === 'string') {
        email = userInfo.email
      }
    }

    return payments.map(payment => ({
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      user: { name, email },
    }))
  }

  async getOrderDetails(orderId: string): Promise<{
    orderId: string
    amount: number
    status: string
    createdAt: Date
    completedAt?: Date
    user: { name: string; email: string }
  }> {
    const order = await this.orderMappingModel.findOne({ orderId }).lean().exec()
    if (!order) {
      throw new Error(`Order not found for orderId: ${orderId}`)
    }

    const userInfo = await this.usersService.findOneUser(order.patient)
    const name = userInfo && 'fullName' in userInfo ? userInfo.fullName : 'Unknown'
    const email = userInfo && 'email' in userInfo ? userInfo.email : 'Unknown'

    return {
      orderId: order.orderId,
      amount: order.amount,
      status: order.status,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
      user: { name, email },
    }
  }

  async getAllOrders(filter?: {
    doctor?: string
    start?: string
    end?: string
    q?: string
  }): Promise<
    {
      orderId: string
      patient: string
      amount: number
      status: string
      createdAt: Date
      completedAt?: Date
      userInfo?: {
        _id: string
        fullName: string
        email: string
      }
      appointmentInfo?: {
        _id: string
        appointmentId: string
        date: string
        slot: string
        status: string
      }
      doctorInfo?: {
        _id: string
        fullName: string
        email: string
        specialty?: {
          _id: string
          name: string
        }
      }
    }[]
  > {
    try {
      const query: Record<string, unknown> = {}

      if (filter?.doctor) {
      }

      if (filter?.start || filter?.end) {
        query.createdAt = {}
        if (filter.start) (query.createdAt as Record<string, unknown>).$gte = new Date(filter.start)
        if (filter.end) (query.createdAt as Record<string, unknown>).$lte = new Date(filter.end)
      }

      if (filter?.q) {
        const q = filter.q.trim()
        const regex = { $regex: q, $options: 'i' }
        const or: Record<string, unknown>[] = [{ orderId: regex }]
        const isObjectId = /^[a-f\d]{24}$/i.test(q)
        if (isObjectId) {
          or.push({ patient: q })
          or.push({ appointmentId: q })
        }
        query.$or = or
      }

      const orders = await this.orderMappingModel.find(query).sort({ createdAt: -1 }).lean().exec()
      const patientIds = orders.map(order => order.patient).filter(Boolean)
      const patients = await this.usersService.findManyPatientsByIds(patientIds)

      // Lấy appointments với populate doctor
      const appointmentIds = orders
        .map(order => order.appointmentId)
        .filter(Boolean)
        .map(id => id?.toString() || '')
      const appointments = await this.appointmentService.findManyAppointmentsByIds(
        appointmentIds,
        true,
      )

      const ordersWithAppointmentInfo = orders.map(order => {
        const userInfo = patients.find(p => p._id.toString() === order.patient)
        const appointmentInfo = appointments.find(
          a => String(a._id) === String(order.appointmentId),
        )
        // Lấy thông tin bác sĩ từ appointment nếu có
        const doctorInfo = appointmentInfo?.doctor || null

        return {
          ...order,
          userInfo: userInfo,
          appointmentInfo: appointmentInfo,
          doctorInfo: doctorInfo,
        }
      })

      // Sort lại theo ngày hẹn (appointmentInfo.date) nếu có, nếu không thì theo createdAt
      const sortedOrders = ordersWithAppointmentInfo.sort((a, b) => {
        const dateA = a.appointmentInfo?.date
          ? new Date(a.appointmentInfo.date).getTime()
          : new Date(a.createdAt).getTime()
        const dateB = b.appointmentInfo?.date
          ? new Date(b.appointmentInfo.date).getTime()
          : new Date(b.createdAt).getTime()
        return dateB - dateA // Descending
      })

      // Nếu có filter doctor, filter lại theo doctor sau khi populate appointmentInfo
      let filteredOrders = filter?.doctor
        ? sortedOrders.filter(
            order => order.appointmentInfo?.doctor?._id?.toString() === filter.doctor,
          )
        : sortedOrders

      if (filter?.q) {
        const q = filter.q.toLowerCase()
        filteredOrders = filteredOrders.filter(
          order =>
            order.orderId?.toLowerCase().includes(q) ||
            order.userInfo?.fullName?.toLowerCase().includes(q) ||
            order.appointmentInfo?.doctor?.fullName?.toLowerCase().includes(q),
        )
      }

      return filteredOrders
    } catch (error) {
      this.logger.error('Error getting all orders:', error)
      throw error
    }
  }

  async verifyTransaction(orderId: string, patient: string): Promise<boolean> {
    try {
      const order = await this.orderMappingModel
        .findOne({ orderId, patient, status: 'completed' })
        .exec()
      return !!order
    } catch (error) {
      this.logger.error(
        `Error verifying transaction for orderId=${orderId}, patient=${patient}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      )
      return false
    }
  }

  async generateWalletOrderId(): Promise<string> {
    let orderId = ''
    let isUnique = false
    while (!isUnique) {
      const randomNum = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')
      orderId = `WALLET-${randomNum}`
      // Kiểm tra trùng lặp
      const existing = await this.getOrderMapping(orderId).catch(() => null)
      if (!existing) isUnique = true
    }
    return orderId
  }

  async paySalary(dto: PaySalaryDto): Promise<{
    message: string
    status: number
    data: { updated: number; orders: { _id: string; salaryStatus: boolean }[] }
  }> {
    const { doctorIds, orderIds, startDate, endDate } = dto
    // Validate doctor
    for (const doctorId of doctorIds) {
      await this.usersService.getDoctorById(doctorId)
    }
    // Lấy orders hợp lệ, populate appointmentId
    const query: Record<string, unknown> = {
      _id: { $in: orderIds.map(id => new Types.ObjectId(id)) },
      status: 'completed',
      $or: [{ salaryStatus: { $exists: false } }, { salaryStatus: false }],
    }
    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate }
    }
    const orders = await this.orderMappingModel.find(query).populate('appointmentId').lean()
    if (!orders.length) {
      // Kiểm tra chi tiết lý do không có order hợp lệ
      const allOrders = await this.orderMappingModel
        .find({
          _id: { $in: orderIds.map(id => new Types.ObjectId(id)) },
          ...(startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
        })
        .lean()
      if (!allOrders.length) {
        return {
          message: 'Không tìm thấy order nào với orderIds và ngày đã chọn',
          status: 404,
          data: { updated: 0, orders: [] },
        }
      }
      const notCompleted = allOrders.filter(o => o.status !== 'completed')
      if (notCompleted.length === allOrders.length) {
        return {
          message: 'Tất cả order đều chưa hoàn thành (status != completed)',
          status: 400,
          data: { updated: 0, orders: [] },
        }
      }
      const alreadyPaid = allOrders.filter(o => o.salaryStatus === true)
      if (alreadyPaid.length === allOrders.length) {
        return {
          message: 'Tất cả order đã được thanh toán lương trước đó',
          status: 400,
          data: { updated: 0, orders: [] },
        }
      }
      return {
        message: 'Không có order nào đủ điều kiện (phải completed và chưa thanh toán lương)',
        status: 400,
        data: { updated: 0, orders: [] },
      }
    }
    // Tổng hợp số tiền cần trừ cho từng bác sĩ
    const doctorSalaryMap: Record<string, number> = {}
    for (const order of orders) {
      const appointment = order.appointmentId as unknown as AppointmentPopulated
      if (!appointment || typeof appointment !== 'object' || !('doctor' in appointment)) continue
      const docId = String(appointment.doctor)
      if (!doctorIds.includes(docId)) continue
      doctorSalaryMap[docId] = (doctorSalaryMap[docId] || 0) + order.amount * 0.9
    }
    // Cập nhật salaryStatus cho order
    const updatedOrders: { _id: string; salaryStatus: boolean }[] = []
    for (const order of orders) {
      const appointment = order.appointmentId as unknown as AppointmentPopulated
      if (!appointment || typeof appointment !== 'object' || !('doctor' in appointment)) continue
      const docId = String(appointment.doctor)
      if (!doctorIds.includes(docId)) continue
      await this.orderMappingModel.updateOne({ _id: order._id }, { $set: { salaryStatus: true } })
      updatedOrders.push({ _id: order._id.toString(), salaryStatus: true })
    }
    // Trừ tiền ví bác sĩ và lưu lịch sử
    for (const doctorId of Object.keys(doctorSalaryMap)) {
      const amount = doctorSalaryMap[doctorId]
      await this.usersService.updateWalletBalance(
        doctorId,
        amount,
        'WITHDRAW',
        `Thanh toán lương cho các order: ${orders
          .filter(o => {
            const appointment = o.appointmentId as unknown as AppointmentPopulated
            return (
              appointment &&
              typeof appointment === 'object' &&
              'doctor' in appointment &&
              String(appointment.doctor) === doctorId
            )
          })
          .map(o => o._id)
          .join(', ')}`,
      )
    }
    return {
      message: 'Thanh toán lương thành công',
      status: 200,
      data: {
        updated: updatedOrders.length,
        orders: updatedOrders,
      },
    }
  }
}
