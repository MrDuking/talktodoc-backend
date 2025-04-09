import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment from 'moment';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { OrderMapping } from './schemas/order-mapping.schema';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import {
  PaymentUrlResponse,
  PaymentVerificationResponse,
  VnpayParams,
} from './interfaces/payment.interface';
import { UsersService } from '../user-service/user.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  private readonly vnp_TmnCode: string;
  private readonly vnp_HashSecret: string;
  private readonly vnp_Url: string;
  private readonly urlCallBack: string;

  constructor(
    @InjectModel(OrderMapping.name)
    private orderMappingModel: Model<OrderMapping>,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.vnp_TmnCode = this.configService.get<string>('VNP_TMNCODE') || '';
    this.vnp_HashSecret = this.configService.get<string>('VNP_HASH_SECRET') || '';
    this.vnp_Url = this.configService.get<string>('VNP_URL') || '';
    this.urlCallBack = this.configService.get<string>('VNP_RETURN_URL') || '';
  }

  async createPaymentUrl(
    request: PaymentRequestDto,
  ): Promise<PaymentUrlResponse> {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const orderId = moment(date).format('DDHHmmss') + randomNum;

    this.logger.log(`Generated orderId: ${orderId}`);

    await this.storeOrderUserMapping(orderId, request.userId, request.amount);

    let vnp_Params: VnpayParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: 'Thanh toan lich hen: ' + orderId,
      vnp_OrderType: 'billpayment',
      vnp_Amount: request.amount * 100,
      vnp_ReturnUrl: this.urlCallBack,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    // Sort and build query string manually
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .map((key) => `${key}=${vnp_Params[key]}`)
      .join('&');

    // Create secure hash manually (no qs.stringify)
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(sortedParams, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;

    // Rebuild final URL
    const queryString = Object.keys(vnp_Params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(vnp_Params[key])}`)
      .join('&');

    const vnpUrl = `${this.vnp_Url}?${queryString}`;

    return { paymentUrl: vnpUrl };
  }

  async processSimpleCallback(
    callbackData: PaymentCallbackDto,
  ): Promise<PaymentVerificationResponse> {
    try {
      if (callbackData.vnp_ResponseCode === '00') {
        const orderId = callbackData.vnp_TxnRef || '';
        const orderMapping = await this.getOrderMapping(orderId);

        if (orderMapping) {
          await this.updateOrderStatus(orderId, 'completed');
          return {
            success: true,
            message: 'Payment successful',
            orderId,
            userId: orderMapping.userId,
          };
        } else {
          return {
            success: false,
            message: 'Order not found',
            orderId,
          };
        }
      } else {
        return {
          success: false,
          message: `Payment failed: ${callbackData.vnp_ResponseCode}`,
          orderId: callbackData.vnp_TxnRef,
        };
      }
    } catch (error) {
      this.logger.error('Payment verification error:', error);
      return {
        success: false,
        message: 'Payment verification error',
      };
    }
  }

  async storeOrderUserMapping(
    orderId: string,
    userId: string,
    amount: number,
  ): Promise<OrderMapping> {
    return this.orderMappingModel.create({
      orderId,
      userId,
      amount,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  async getOrderMapping(orderId: string): Promise<OrderMapping | null> {
    return this.orderMappingModel.findOne({ orderId }).exec();
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
  ): Promise<OrderMapping | null> {
    return this.orderMappingModel
      .findOneAndUpdate(
        { orderId },
        {
          status,
          completedAt: status === 'completed' ? new Date() : undefined,
        },
        { new: true },
      )
      .exec();
  }

  sortObject(obj: any): any {
    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  async getSimplifiedPaymentHistory(userId: string) {
    const payments = await this.orderMappingModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();

    const userInfo = await this.usersService.findOneUser(userId);
    if (!userInfo) throw new NotFoundException('User not found');

    const baseUser = userInfo as any;

    return payments.map((payment) => ({
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      user: {
        name: baseUser.name,
        email: baseUser.email,
      },
    }));
  }

  async getOrderDetails(orderId: string) {
    return this.orderMappingModel.findOne({ orderId }).exec();
  }

  async getAllOrders() {
    const orders = await this.orderMappingModel.find().exec();
    const ordersWithUserInfo = await Promise.all(
      orders.map(async (order) => {
        try {
          const userInfo = await this.usersService.findOneUser(order.userId);
          const baseUser = userInfo as any;
          return {
            ...order.toJSON(),
            userInfo: baseUser
              ? {
                  _id: baseUser._id,
                  name: baseUser.name,
                  email: baseUser.email,
                }
              : { message: 'User not found' },
          };
        } catch (error) {
          this.logger.error(
            `Error getting user info for order ${order.orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          return {
            ...order.toJSON(),
            userInfo: { message: 'Error fetching user info' },
          };
        }
      }),
    );

    return ordersWithUserInfo;
  }
}