// src/payment/payment.controller.ts
import { Body, Controller, Get, HttpException, HttpStatus, Logger, Param, Post } from "@nestjs/common"
import { PaymentCallbackDto } from "./dto/payment-callback.dto"
import { PaymentRequestDto } from "./dto/payment-request.dto"
import { PaymentService } from "./payment.service"

@Controller("payment")
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name)

    constructor(private readonly paymentService: PaymentService) {}

    @Post("create-payment-url")
    async createPaymentUrl(@Body() request: PaymentRequestDto) {
        try {
            this.logger.log(`Creating payment URL for userId: ${request.userId}, amount: ${request.amount}`)
            return await this.paymentService.createPaymentUrl(request)
        } catch (error) {
            this.logger.error("Failed to create payment URL", error)
            throw new HttpException("Failed to create payment URL", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Post("vnpay-callback")
    async handleCallback(@Body() callbackData: PaymentCallbackDto) {
        try {
            this.logger.log(`Received callback for TxnRef: ${callbackData.vnp_TxnRef}`)
            return await this.paymentService.processSimpleCallback(callbackData)
        } catch (error) {
            this.logger.error("Failed to process payment callback", error)
            throw new HttpException("Failed to process payment callback", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get("history/:userId")
    async getHistory(@Param("userId") userId: string) {
        try {
            return await this.paymentService.getSimplifiedPaymentHistory(userId)
        } catch (error) {
            this.logger.error(`Failed to get history for user ${userId}`, error)
            throw new HttpException("Failed to get payment history", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get("order/:orderId")
    async getOrder(@Param("orderId") orderId: string) {
        try {
            return await this.paymentService.getOrderDetails(orderId)
        } catch (error) {
            this.logger.error(`Failed to get order details for ${orderId}`, error)
            throw new HttpException("Failed to get order details", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get("all-orders")
    async getAllOrders() {
        try {
            return await this.paymentService.getAllOrders()
        } catch (error) {
            this.logger.error("Failed to get all orders", error)
            throw new HttpException("Failed to get all orders", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
