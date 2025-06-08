import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { PaySalaryDto } from './dto/pay-salary.dto'
import { PaymentCallbackDto } from './dto/payment-callback.dto'
import { PaymentRequestDto } from './dto/payment-request.dto'
import { PaymentService } from './payment.service'

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name)

  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-url')
  async createPaymentUrl(@Body() request: PaymentRequestDto): Promise<any> {
    try {
      this.logger.log(
        `Creating payment URL for user: ${request.patient} with amount: ${request.amount}`,
      )
      return await this.paymentService.createPaymentUrl(request)
    } catch (error) {
      this.logger.error('Failed to create payment URL', error)
      throw new HttpException('Failed to create payment URL', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Post('vnpay-callback')
  async vnpayCallback(@Body() callbackData: PaymentCallbackDto): Promise<any> {
    try {
      this.logger.log(`Received payment callback for order: ${callbackData.vnp_TxnRef}`)

      // Simplified callback processing
      return await this.paymentService.processSimpleCallback(callbackData)
    } catch (error) {
      this.logger.error('Failed to process payment callback', error)
      throw new HttpException(
        'Failed to process payment callback',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get('history/:patient')
  async getPaymentHistory(@Param('patient') patient: string): Promise<any> {
    try {
      // Return simplified payment history
      return await this.paymentService.getSimplifiedPaymentHistory(patient)
    } catch (error) {
      this.logger.error(`Failed to get payment history for user: ${patient}`, error)
      throw new HttpException('Failed to fetch payment history', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('order/:orderId')
  async getOrderDetails(@Param('orderId') orderId: string) {
    try {
      return await this.paymentService.getOrderDetails(orderId)
    } catch (error) {
      this.logger.error(`Failed to get order details for order: ${orderId}`, error)
      throw new HttpException('Failed to fetch order details', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('all-orders')
  async getAllOrders(
    @Query('doctor') doctor?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    try {
      return await this.paymentService.getAllOrders({ doctor, start, end })
    } catch (error) {
      this.logger.error('Failed to get all orders', error)
      throw new HttpException('Failed to fetch all orders', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('all-orders/doctor')
  async getAllOrdersByDoctor(
    @Query('doctor') doctor?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('q') q?: string,
  ): Promise<any[]> {
    try {
      const orders = await this.paymentService.getAllOrders({ doctor, start, end, q })
      return orders
    } catch (error) {
      this.logger.error('Failed to get all orders by doctor', error)
      throw new HttpException(
        'Failed to fetch all orders by doctor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post('pay-salary')
  async paySalary(@Body() dto: PaySalaryDto): Promise<any> {
    try {
      return await this.paymentService.paySalary(dto)
    } catch (error) {
      this.logger.error('Failed to pay salary', error)
      throw new HttpException('Failed to pay salary', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
