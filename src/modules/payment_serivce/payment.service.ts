import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import * as crypto from 'crypto'
import moment from 'moment'
import { Model } from 'mongoose'
import * as querystring from 'qs'
import { UsersService } from '../user-service/user.service'
import { PaymentCallbackDto } from './dto/payment-callback.dto'
import { PaymentRequestDto } from './dto/payment-request.dto'
import {
  PaymentUrlResponse,
  PaymentVerificationResponse,
  VnpayParams,
} from './interfaces/payment.interface'
import { OrderMapping } from './schemas/order-mapping.schema'

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name)

  // Direct variable declarations
  private readonly vnp_TmnCode: string
  private readonly vnp_HashSecret: string
  private readonly vnp_Url: string
  private readonly urlCallBack: string

  constructor(
    @InjectModel(OrderMapping.name)
    private orderMappingModel: Model<OrderMapping>,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    // Initialize variables in constructor
    this.vnp_TmnCode = this.configService.get<string>('VNP_TMN_CODE') || 'BAXGHO1O'
    this.vnp_HashSecret =
      this.configService.get<string>('VNP_HASH_SECRET') || 'W6AXF4895PIAWHEKVS7KAZ8QTX6DPXR3'
    this.vnp_Url =
      this.configService.get<string>('VNP_URL') ||
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
    this.urlCallBack =
      this.configService.get<string>('VNP_CALLBACK_URL') ||
      process.env.CALLBACK_URL_VNPAY ||
      'http://dashboard.talktodoc.online/payment'
  }

  async createPaymentUrl(request: PaymentRequestDto): Promise<PaymentUrlResponse> {
    process.env.TZ = 'Asia/Ho_Chi_Minh'

    const date = new Date()
    const createDate = moment(date).format('YYYYMMDDHHmmss')

    // Add random number to avoid duplicate orderId
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    const orderId = moment(date).format('DDHHmmss') + randomNum

    this.logger.log(`Generated orderId: ${orderId}`)

        try {
            // Store order mapping
            await this.storeOrderUserMapping(orderId, request.patient, request.amount)

      // Build payment parameters - simplified but keeping required VNPay fields
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

      // Sort and sign
      vnp_Params = this.sortObject(vnp_Params)
      const signData = querystring.stringify(vnp_Params, { encode: false })

      if (!this.vnp_HashSecret) {
        throw new Error('VNP_HASH_SECRET is undefined')
      }

      const hmac = crypto.createHmac('sha512', this.vnp_HashSecret)
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
      vnp_Params['vnp_SecureHash'] = signed

      // Build URL
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

  // Simplified callback processing
  async processSimpleCallback(
    callbackData: PaymentCallbackDto,
  ): Promise<PaymentVerificationResponse> {
    try {
      // Kiểm tra mã phản hồi từ cổng thanh toán
      if (callbackData.vnp_ResponseCode === '00') {
        const orderId = callbackData.vnp_TxnRef
        const orderMapping = await this.getOrderMapping(orderId)

        if (orderMapping) {
          // Cập nhật trạng thái đơn hàng
          await this.updateOrderStatus(orderId, 'completed')

                    return {
                        success: true,
                        message: "Payment successful, order marked as completed",
                        orderId,
                        patient: orderMapping.patient
                    }
                } else {
                    return {
                        success: false,
                        message: "Order not found",
                        orderId
                    }
                }
            } else {
                return {
                    success: false,
                    message: `Payment failed: ${callbackData.vnp_ResponseCode}`,
                    orderId: callbackData.vnp_TxnRef
                }
            }
        } catch (error) {
            this.logger.error("Payment verification error:", error)
            return {
                success: false,
                message: "Payment verification error"
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

    async storeOrderUserMapping(orderId: string, patient: string, amount: number): Promise<OrderMapping> {
        try {
            return this.orderMappingModel.create({
                orderId,
                patient,
                amount,
                status: "pending",
                createdAt: new Date()
            })
        } catch (error: unknown) {
            this.logger.error(`Error storing order mapping: ${error instanceof Error ? error.message : "Unknown error"}`, error instanceof Error ? error.stack : undefined)
            throw error
        }
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
    const str: string[] = []
    let key: string
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key))
      }
    }
    str.sort()
    for (let i = 0; i < str.length; i++) {
      const value = obj[str[i]]
      sorted[str[i]] = encodeURIComponent(String(value)).replace(/%20/g, '+')
    }
    return sorted
  }

    // Simplified payment history retrieval
    async getSimplifiedPaymentHistory(patient: string) {
        const payments = await this.orderMappingModel
            .find({ patient })
            .sort({ createdAt: 1 }) // Sắp xếp giảm dần theo thời gian tạo
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
      user: {
        name,
        email,
      },
    }))
  }

  async getOrderDetails(orderId: string): Promise<{
    orderId: string
    amount: number
    status: string
    createdAt: Date
    completedAt?: Date
    user: {
      name: string
      email: string
    }
  }> {
    const order = await this.orderMappingModel.findOne({ orderId }).lean().exec()
    if (!order) {
      throw new Error(`Order not found for orderId: ${orderId}`)
    }

    // Lấy user object bằng patient id (order.patient)
    async getAllOrders() {
        try {
            const orders = await this.orderMappingModel.find().sort({ createdAt: -1 }).lean().exec()

            const patientIds = orders.map((order) => order.patient).filter(Boolean)
            console.log("patientIds", patientIds)
            const patients = await this.usersService.findManyPatientsByIds(patientIds)
            console.log("patients", patients)
            const ordersWithUserInfo = orders.map((order) => {
                const userInfo = patients.find((patient) => patient._id?.toString() === order.patient)
                let userResult: any = { message: `User not found for patient ${order.patient}` }
                console.log("userInfo", userInfo)
                if (userInfo && typeof userInfo === "object") {
                    userResult = {
                        _id: userInfo._id,
                        name: userInfo.fullName || "Unknown",
                        email: userInfo.email || "Unknown"
                    }
                }
                console.log("userResult", userResult)
                return {
                    ...order,
                    userInfo: userResult
                }
            })

      // Lấy thông tin người dùng cho tất cả đơn hàng
      const ordersWithUserInfo = await Promise.all(
        orders.map(async order => {
          const userInfo = await this.usersService.findOneUser(order.userId)
          return {
            ...order,
            userInfo: {
              fullName: userInfo?.fullName || '',
              email: userInfo?.email || '',
            },
          }
        }),
      )

      return ordersWithUserInfo
    } catch (error) {
      this.logger.error('Error getting all orders:', error)
      throw error
    }
    async verifyTransaction(orderId: string, patient: string): Promise<boolean> {
        try {
            const order = await this.orderMappingModel
                .findOne({
                    orderId,
                    patient,
                    status: "completed"
                })
                .exec()

            return !!order
        } catch (error) {
            this.logger.error(`Error verifying transaction for orderId=${orderId}, patient=${patient}: ${error instanceof Error ? error.message : "Unknown error"}`)
            return false
        }
    }
  }
}
