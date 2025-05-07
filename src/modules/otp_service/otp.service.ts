import { BadRequestException, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { randomInt } from "crypto"
import { Model } from "mongoose"
import * as nodemailer from "nodemailer"
import { EmailOtp } from "./schemas/email-otp.schema"

@Injectable()
export class OtpService {
    constructor(@InjectModel(EmailOtp.name) private otpModel: Model<EmailOtp>) {}

    private transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })

    async sendOtp(email: string) {
        const otp = randomInt(100000, 999999).toString()
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000)

        await this.otpModel.findOneAndUpdate({ email }, { email, otp, expiresAt, isVerified: false }, { upsert: true, new: true })

        await this.transporter.sendMail({
            from: `"TalkToDoc Support" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Mã xác thực OTP - TalkToDoc",
            text: `Xin chào,\n\nMã xác thực OTP của bạn là: ${otp}\nMã này có hiệu lực trong vòng 1 phút.\n\nNếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ TalkToDoc`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #2E86C1;">Xác thực đăng ký tài khoản</h2>
          <p>Xin chào,</p>
          <p>Chúng tôi đã nhận được yêu cầu xác minh địa chỉ email của bạn trên <strong>TalkToDoc</strong>.</p>
          <p style="font-size: 18px;">Mã OTP của bạn là:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">${otp}</div>
          <p>Mã này sẽ hết hạn sau <strong>1 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
          <hr />
          <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} TalkToDoc. All rights reserved.</p>
        </div>
      `
        })

        return { message: "OTP đã được gửi đến email của bạn" }
    }

    async verifyOtp(email: string, otp: string) {
        const record = await this.otpModel.findOne({ email, otp })

        if (!record) throw new BadRequestException("OTP Không hợp lệ")
        if (record.isVerified) throw new BadRequestException("OTP đã được sử dụng")
        if (record.expiresAt < new Date()) throw new BadRequestException("OTP đã hết hạn")

        record.isVerified = true
        await record.save()

        return { message: "OTP đã được xác thực thành công" }
    }
}
