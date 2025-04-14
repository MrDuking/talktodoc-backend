import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Param,
  Get,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-url')
  async createPaymentUrl(@Body() request: PaymentRequestDto) {
    try {
      this.logger.log(
        `Creating payment URL for user: ${request.userId} with amount: ${request.amount}`,
      );
      return await this.paymentService.createPaymentUrl(request);
    } catch (error) {
      this.logger.error('Failed to create payment URL', error);
      throw new HttpException(
        'Failed to create payment URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('vnpay-callback')
  async vnpayCallback(@Body() callbackData: PaymentCallbackDto) {
    try {
      this.logger.log(
        `Received payment callback for order: ${callbackData.vnp_TxnRef}`,
      );

      // Simplified callback processing
      return await this.paymentService.processSimpleCallback(callbackData);
    } catch (error) {
      this.logger.error('Failed to process payment callback', error);
      throw new HttpException(
        'Failed to process payment callback',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history/:userId')
  async getPaymentHistory(@Param('userId') userId: string) {
    try {
      // Return simplified payment history
      return await this.paymentService.getSimplifiedPaymentHistory(userId);
    } catch (error) {
      this.logger.error(
        `Failed to get payment history for user: ${userId}`,
        error,
      );
      throw new HttpException(
        'Failed to fetch payment history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('order/:orderId')
  async getOrderDetails(@Param('orderId') orderId: string) {
    try {
      return await this.paymentService.getOrderDetails(orderId);
    } catch (error) {
      this.logger.error(
        `Failed to get order details for order: ${orderId}`,
        error,
      );
      throw new HttpException(
        'Failed to fetch order details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all-orders')
  async getAllOrders() {
    try {
      return await this.paymentService.getAllOrders();
    } catch (error) {
      this.logger.error('Failed to get all orders', error);
      throw new HttpException(
        'Failed to fetch all orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
