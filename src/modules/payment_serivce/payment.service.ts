// import { Injectable, Logger } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import * as moment from 'moment-timezone';
// import * as crypto from 'crypto';
// import * as querystring from 'qs';
// import { ConfigService } from '@nestjs/config';
// import { OrderMapping } from './schemas/order-mapping.schema';
// import { PaymentRequestDto } from './dto/payment-request.dto';
// import { PaymentCallbackDto } from './dto/payment-callback.dto';
// import {
//   PaymentUrlResponse,
//   PaymentVerificationResponse,
//   VnpayParams,
// } from './interfaces/payment.interface';
// import { UsersService } from '../user-service/user.service';

// @Injectable()
// export class PaymentService {
//   private readonly logger = new Logger(PaymentService.name);

//   // Direct variable declarations
//   private readonly vnp_TmnCode: string;
//   private readonly vnp_HashSecret: string;
//   private readonly vnp_Url: string;
//   private readonly urlCallBack: string;

//   constructor(
//     @InjectModel(OrderMapping.name)
//     private orderMappingModel: Model<OrderMapping>,
//     private configService: ConfigService,
//     private usersService: UsersService,
//   ) {
//     // Initialize variables in constructor
//     this.vnp_TmnCode =
//       this.configService.get<string>('VNP_TMN_CODE') || '3VSKGQK4';
//     this.vnp_HashSecret =
//       this.configService.get<string>('VNP_HASH_SECRET') ||
//       'BEQP1TAVXUG5P4WSANIZLWE6DYP55RHD';
//     this.vnp_Url =
//       this.configService.get<string>('VNP_URL') ||
//       'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
//     this.urlCallBack =
//       this.configService.get<string>('VNP_CALLBACK_URL') ||
//       'http://localhost:5173/payment';
//   }

//   async createPaymentUrl(
//     request: PaymentRequestDto,
//   ): Promise<PaymentUrlResponse> {
//     process.env.TZ = 'Asia/Ho_Chi_Minh';

//     const date = new Date();
//     const createDate = moment(date).format('YYYYMMDDHHmmss');

//     // Add random number to avoid duplicate orderId
//     const randomNum = Math.floor(Math.random() * 1000)
//       .toString()
//       .padStart(3, '0');
//     const orderId = moment(date).format('DDHHmmss') + randomNum;

//     this.logger.log(`Generated orderId: ${orderId}`);

//     try {
//       // Store order mapping
//       await this.storeOrderUserMapping(orderId, request.userId, request.amount);

//       // Build payment parameters - simplified but keeping required VNPay fields
//       let vnp_Params: VnpayParams = {
//         vnp_Version: '2.1.0',
//         vnp_Command: 'pay',
//         vnp_TmnCode: this.vnp_TmnCode,
//         vnp_Locale: 'vn',
//         vnp_CurrCode: 'VND',
//         vnp_TxnRef: orderId,
//         vnp_OrderInfo: 'Thanh toan Premium: ' + orderId,
//         vnp_OrderType: 'billpayment',
//         vnp_Amount: request.amount * 100,
//         vnp_ReturnUrl: this.urlCallBack,
//         vnp_IpAddr: '127.0.0.1',
//         vnp_CreateDate: createDate,
//       };

//       // Sort and sign
//       vnp_Params = this.sortObject(vnp_Params);
//       const signData = querystring.stringify(vnp_Params, { encode: false });

//       if (!this.vnp_HashSecret) {
//         throw new Error('VNP_HASH_SECRET is undefined');
//       }

//       const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
//       const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
//       vnp_Params['vnp_SecureHash'] = signed;

//       // Build URL
//       const vnpUrl =
//         this.vnp_Url +
//         '?' +
//         querystring.stringify(vnp_Params, { encode: false });

//       return { paymentUrl: vnpUrl };
//     } catch (error) {
//       this.logger.error(
//         `Error creating payment URL: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }

//   // Simplified callback processing
//   async processSimpleCallback(
//     callbackData: PaymentCallbackDto,
//   ): Promise<PaymentVerificationResponse> {
//     try {
//       // For test projects, we can simplify and just check the response code
//       if (callbackData.vnp_ResponseCode === '00') {
//         const orderId = callbackData.vnp_TxnRef;
//         const orderMapping = await this.getOrderMapping(orderId);

//         if (orderMapping) {
//           // Update order status
//           await this.updateOrderStatus(orderId, 'completed');

//           // Update user package
//           await this.usersService.updatePackagePremium(orderMapping.userId);

//           return {
//             success: true,
//             message: 'Payment successful, package upgraded to premium',
//             orderId,
//             userId: orderMapping.userId,
//           };
//         } else {
//           return {
//             success: false,
//             message: 'Order not found',
//             orderId,
//           };
//         }
//       } else {
//         return {
//           success: false,
//           message: `Payment failed: ${callbackData.vnp_ResponseCode}`,
//           orderId: callbackData.vnp_TxnRef,
//         };
//       }
//     } catch (error) {
//       this.logger.error('Payment verification error:', error);
//       return {
//         success: false,
//         message: 'Payment verification error',
//       };
//     }
//   }

//   async storeOrderUserMapping(
//     orderId: string,
//     userId: string,
//     amount: number,
//   ): Promise<OrderMapping> {
//     try {
//       return this.orderMappingModel.create({
//         orderId,
//         userId,
//         amount,
//         status: 'pending',
//         createdAt: new Date(),
//       });
//     } catch (error) {
//       this.logger.error(
//         `Error storing order mapping: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }

//   async getOrderMapping(orderId: string): Promise<OrderMapping> {
//     return this.orderMappingModel.findOne({ orderId }).exec();
//   }

//   async updateOrderStatus(
//     orderId: string,
//     status: string,
//   ): Promise<OrderMapping> {
//     return this.orderMappingModel
//       .findOneAndUpdate(
//         { orderId },
//         {
//           status,
//           completedAt: status === 'completed' ? new Date() : undefined,
//         },
//         { new: true },
//       )
//       .exec();
//   }

//   sortObject(obj: any): any {
//     const sorted = {};
//     const str = [];
//     let key;
//     for (key in obj) {
//       if (obj.hasOwnProperty(key)) {
//         str.push(encodeURIComponent(key));
//       }
//     }
//     str.sort();
//     for (key = 0; key < str.length; key++) {
//       sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
//     }
//     return sorted;
//   }

//   // Simplified payment history retrieval
//   async getSimplifiedPaymentHistory(userId: string) {
//     const payments = await this.orderMappingModel
//       .find({ userId })
//       .sort({ createdAt: -1 })
//       .exec();

//     const userInfo = await this.usersService.findOneUser(userId);

//     // Return only essential fields
//     return payments.map((payment) => ({
//       orderId: payment.orderId,
//       amount: payment.amount,
//       status: payment.status,
//       createdAt: payment.createdAt,
//       completedAt: payment.completedAt,
//       user: {
//         name: userInfo.name,
//         email: userInfo.email,
//       },
//     }));
//   }
//   getOrderDetails(orderId: string) {
//     return this.orderMappingModel.findById(orderId).exec();
//   }

//   async getAllOrders() {
//     try {
//       // Lấy tất cả các đơn hàng từ cơ sở dữ liệu
//       const orders = await this.orderMappingModel.find().exec();

//       // Sử dụng Promise.all để xử lý các đơn hàng bất đồng bộ
//       const ordersWithUserInfo = await Promise.all(
//         orders.map(async (order) => {
//           try {
//             // Lấy thông tin người dùng dựa trên userId từ đơn hàng
//             const userInfo = await this.usersService.findOneUser(order.userId);

//             // Kết hợp thông tin đơn hàng với thông tin người dùng
//             return {
//               ...order.toJSON(),
//               userInfo: userInfo
//                 ? {
//                     _id: userInfo._id,
//                     name: userInfo.name,
//                     email: userInfo.email,
//                   }
//                 : { message: 'User not found' },
//             };
//           } catch (error) {
//             this.logger.error(
//               `Error getting user info for order ${order.orderId}: ${error.message}`,
//             );
//             return {
//               ...order.toJSON(),
//               userInfo: { message: 'Error fetching user info' },
//             };
//           }
//         }),
//       );

//       return ordersWithUserInfo;
//     } catch (error) {
//       this.logger.error(
//         `Error getting all orders: ${error.message}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }
// }
