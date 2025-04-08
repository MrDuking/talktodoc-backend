// // src/payment/payment.controller.ts
// import { Body, Controller, Get, Logger, Post, Query, Req, Res } from "@nestjs/common"
// import { InjectModel } from "@nestjs/mongoose"
// import { ApiOperation, ApiTags } from "@nestjs/swagger"
// import { Request, Response } from "express"
// import { Model } from "mongoose"
// import { CreatePaymentDto } from "./dtos/create-payment.dto"
// import { PaymentService } from "./payment.service"
// import { Payment } from "./schemas/payment.schema"

// @ApiTags("Payment")
// @Controller("payment")
// export class PaymentController {
//     private readonly logger = new Logger(PaymentController.name)

//     constructor(
//         private readonly paymentService: PaymentService,
//         @InjectModel(Payment.name) private paymentModel: Model<Payment>
//     ) {}

//     @Post("create-url")
//     @ApiOperation({ summary: "Generate VNPAY payment URL" })
//     async createPayment(@Body() dto: CreatePaymentDto, @Req() req: Request) {
//         const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress
//         const paymentUrl = await this.paymentService.createPaymentUrl(dto, String(ip))
//         return { paymentUrl }
//     }

//     @Get("return")
//     @ApiOperation({ summary: "Handle redirect from VNPAY after payment (for user view)" })
//     async handleReturn(@Query() query: Record<string, string>, @Res() res: Response) {
//         const { vnp_SecureHash, vnp_TxnRef, vnp_ResponseCode } = query

//         const isValid = this.paymentService.validateChecksum(query, vnp_SecureHash)
//         if (!isValid) {
//             return res.render("payment-result", { message: "Invalid checksum!" })
//         }

//         if (vnp_ResponseCode === "00") {
//             await this.paymentModel.updateOne({ orderId: vnp_TxnRef }, { status: "success" })
//         } else {
//             await this.paymentModel.updateOne({ orderId: vnp_TxnRef }, { status: "fail" })
//         }

//         return res.render("payment-result", {
//             message: "Payment " + (vnp_ResponseCode === "00" ? "successful" : "failed")
//         })
//     }

//     @Get("ipn")
//     @ApiOperation({ summary: "VNPAY IPN callback (server-to-server payment result update)" })
//     async handleIpn(@Query() query: Record<string, string>, @Res() res: Response) {
//         const { vnp_SecureHash, vnp_TxnRef, vnp_ResponseCode, vnp_TransactionStatus } = query
//         const isValid = this.paymentService.validateChecksum(query, vnp_SecureHash)

//         if (!isValid) {
//             return res.status(200).json({ RspCode: "97", Message: "Invalid checksum" })
//         }

//         const payment = await this.paymentModel.findOne({ orderId: vnp_TxnRef })
//         if (!payment) {
//             return res.status(200).json({ RspCode: "01", Message: "Order not found" })
//         }

//         if (payment.status !== "pending") {
//             return res.status(200).json({ RspCode: "02", Message: "Order already processed" })
//         }

//         const newStatus = vnp_ResponseCode === "00" && vnp_TransactionStatus === "00" ? "success" : "fail"

//         await this.paymentModel.updateOne(
//             { orderId: vnp_TxnRef },
//             {
//                 status: newStatus,
//                 bankCode: query.vnp_BankCode,
//                 cardType: query.vnp_CardType,
//                 payDate: query.vnp_PayDate,
//                 responseCode: vnp_ResponseCode,
//                 transactionNo: query.vnp_TransactionNo,
//                 transactionStatus: vnp_TransactionStatus
//             }
//         )

//         return res.status(200).json({ RspCode: "00", Message: "Payment updated successfully" })
//     }
// }

import { Body, Controller, Get, Logger, Post, Query, Req, Res } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { Request, Response } from "express"
import { Model } from "mongoose"
import { CreatePaymentDto } from "./dtos/create-payment.dto"
import { PaymentService } from "./payment.service"
import { Payment } from "./schemas/payment.schema"

@ApiTags("Payment")
@Controller("payment")
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name)

    constructor(
        private readonly paymentService: PaymentService,
        @InjectModel(Payment.name) private paymentModel: Model<Payment>
    ) {}

    @Post("create-url")
    @ApiOperation({ summary: "Generate VNPAY payment URL" })
    async createPayment(@Body() dto: CreatePaymentDto, @Req() req: Request) {
        let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress
        if (ip === "::1") ip = "127.0.0.1" // Convert IPv6 localhost to IPv4 for compatibility

        const paymentUrl = await this.paymentService.createPaymentUrl(dto, String(ip))
        return { paymentUrl }
    }

    @Get("return")
    @ApiOperation({ summary: "Handle redirect from VNPAY after payment (for user view)" })
    async handleReturn(@Query() query: Record<string, string>, @Res() res: Response) {
        const { vnp_SecureHash, vnp_TxnRef, vnp_ResponseCode } = query

        const isValid = this.paymentService.validateChecksum(query, vnp_SecureHash)
        if (!isValid) {
            return res.render("payment-result", { message: "Invalid checksum!" })
        }

        if (vnp_ResponseCode === "00") {
            await this.paymentModel.updateOne({ orderId: vnp_TxnRef }, { status: "success" })
        } else {
            await this.paymentModel.updateOne({ orderId: vnp_TxnRef }, { status: "fail" })
        }

        return res.render("payment-result", {
            message: "Payment " + (vnp_ResponseCode === "00" ? "successful" : "failed")
        })
    }

    @Get("ipn")
    @ApiOperation({ summary: "VNPAY IPN callback (server-to-server payment result update)" })
    async handleIpn(@Query() query: Record<string, string>, @Res() res: Response) {
        const { vnp_SecureHash, vnp_TxnRef, vnp_ResponseCode, vnp_TransactionStatus } = query
        const isValid = this.paymentService.validateChecksum(query, vnp_SecureHash)

        if (!isValid) {
            return res.status(200).json({ RspCode: "97", Message: "Invalid checksum" })
        }

        const payment = await this.paymentModel.findOne({ orderId: vnp_TxnRef })
        if (!payment) {
            return res.status(200).json({ RspCode: "01", Message: "Order not found" })
        }

        if (payment.status !== "pending") {
            return res.status(200).json({ RspCode: "02", Message: "Order already processed" })
        }

        const newStatus = vnp_ResponseCode === "00" && vnp_TransactionStatus === "00" ? "success" : "fail"

        await this.paymentModel.updateOne(
            { orderId: vnp_TxnRef },
            {
                status: newStatus,
                bankCode: query.vnp_BankCode,
                cardType: query.vnp_CardType,
                payDate: query.vnp_PayDate,
                responseCode: vnp_ResponseCode,
                transactionNo: query.vnp_TransactionNo,
                transactionStatus: vnp_TransactionStatus
            }
        )

        return res.status(200).json({ RspCode: "00", Message: "Payment updated successfully" })
    }
}
