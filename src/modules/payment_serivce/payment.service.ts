import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as qs from 'qs';
import moment from 'moment';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './schemas/payment.schema';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly vnpUrl: string;
  private readonly returnUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>
  ) {
    const vnpConfig = this.configService.get('vnpay');
    this.tmnCode = vnpConfig.tmnCode;
    this.hashSecret = vnpConfig.hashSecret;
    this.vnpUrl = vnpConfig.url;
    this.returnUrl = vnpConfig.returnUrl;
  }

  async createPaymentUrl(dto: CreatePaymentDto, ipAddress: string): Promise<string> {
    const createDate = moment().format('YYYYMMDDHHmmss');
    const expireDate = moment().add(15, 'minutes').format('YYYYMMDDHHmmss');

    const vnp_Params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: dto.orderId,
      vnp_OrderInfo: `Thanh toan don hang: ${dto.orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: (dto.amount * 100).toString(),
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddress,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const sortedParams = this.sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    sortedParams['vnp_SecureHash'] = signed;

    const paymentUrl = `${this.vnpUrl}?${qs.stringify(sortedParams, { encode: false })}`;

    await this.paymentModel.create({
      orderId: dto.orderId,
      amount: dto.amount,
      status: 'pending'
    });

    return paymentUrl;
  }

  validateChecksum(params: Record<string, string>, secureHash: string): boolean {
    const cloned = { ...params };
    delete cloned['vnp_SecureHash'];
    delete cloned['vnp_SecureHashType'];

    const sorted = this.sortObject(cloned);
    const signData = qs.stringify(sorted, { encode: false });
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
  }

  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }
}
