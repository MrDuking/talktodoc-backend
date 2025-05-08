// import { Doctor, Employee, Patient } from "@modules/user-service/schemas/index"
// import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common"
// import { InjectModel } from "@nestjs/mongoose"
// import { randomInt } from "crypto"
// import { Model } from "mongoose"
// import * as nodemailer from "nodemailer"
// import { EmailOtp } from "./schemas/email-otp.schema"

// @Injectable()
// export class OtpService {
//     constructor(
//         @InjectModel(EmailOtp.name) private otpModel: Model<EmailOtp>,
//         @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
//         @InjectModel(Patient.name) private patientModel: Model<Patient>,
//         @InjectModel(Employee.name) private employeeModel: Model<Employee>
//     ) {}

//     private transporter = nodemailer.createTransport({
//         // host: 'smtp.gmail.com',
//         // port: 465,
//         ignoreTLS:true,
//         secure:false,
//         service: "gmail",
//         auth: {
//             user: process.env.MAIL_USER,
//             pass: process.env.MAIL_PASS
//         }
//     })

//     private async isEmailTaken(email: string): Promise<boolean> {
//         const [doctor, patient, employee] = await Promise.all([this.doctorModel.findOne({ email }), this.patientModel.findOne({ email }), this.employeeModel.findOne({ email })])
//         return !!(doctor || patient || employee)
//     }

//     async sendOtp(email: string) {
//         if (await this.isEmailTaken(email)) {
//             throw new BadRequestException("Email đã tồn tại trong hệ thống")
//         }

//         const existingOtp = await this.otpModel.findOne({ email })

//         if (existingOtp) {
//             if (existingOtp.isVerified) {
//                 throw new BadRequestException("Email đã được xác thực")
//             }

//             if (existingOtp.expiresAt > new Date()) {
//                 throw new BadRequestException("OTP vẫn còn hiệu lực, vui lòng kiểm tra email của bạn")
//             }
//         }

//         const otp = randomInt(100000, 999999).toString()
//         const expiresAt = new Date(Date.now() + 1 * 60 * 1000)

//         await this.otpModel.findOneAndUpdate({ email }, { email, otp, expiresAt, isVerified: false }, { upsert: true, new: true })

//         try {
//             await this.transporter.sendMail({
//                 from: `"TalkToDoc Support" <${process.env.MAIL_USER}>`,
//                 to: email,
//                 subject: "Mã xác thực OTP - TalkToDoc",
//                 text: `Xin chào,\n\nMã xác thực OTP của bạn là: ${otp}\nMã này có hiệu lực trong vòng 5 phút.\n\nNếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ TalkToDoc`,
//                 html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
//             <h2 style="color: #2E86C1;">Xác thực đăng ký tài khoản</h2>
//             <p>Xin chào,</p>
//             <p>Chúng tôi đã nhận được yêu cầu xác minh địa chỉ email của bạn trên <strong>TalkToDoc</strong>.</p>
//             <p style="font-size: 18px;">Mã OTP của bạn là:</p>
//             <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">${otp}</div>
//             <p>Mã này sẽ hết hạn sau <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
//             <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
//             <hr />
//             <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} TalkToDoc. All rights reserved.</p>
//           </div>
//         `
//             })
//         } catch (error) {
//             console.error("Gửi email OTP thất bại:", error)
//             throw new InternalServerErrorException("Không thể gửi OTP, vui lòng thử lại sau")
//         }

//         return { message: "OTP mới đã được gửi đến email của bạn" }
//     }

//     async verifyOtp(email: string, otp: string) {
//         const record = await this.otpModel.findOne({ email, otp })

//         if (!record) throw new BadRequestException("OTP không hợp lệ")
//         if (record.isVerified) throw new BadRequestException("OTP đã được sử dụng")
//         if (record.expiresAt < new Date()) throw new BadRequestException("OTP đã hết hạn")

//         record.isVerified = true
//         await record.save()

//         return { message: "OTP đã được xác thực thành công" }
//     }
// }
import { Doctor, Employee, Patient } from "@modules/user-service/schemas/index"
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { randomInt } from "crypto"
import { Model } from "mongoose"
import axios from 'axios'
import { EmailOtp } from "./schemas/email-otp.schema"

@Injectable()
export class OtpService {
    constructor(
        @InjectModel(EmailOtp.name) private otpModel: Model<EmailOtp>,
        @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
        @InjectModel(Patient.name) private patientModel: Model<Patient>,
        @InjectModel(Employee.name) private employeeModel: Model<Employee>
    ) {}

    private async isEmailTaken(email: string): Promise<boolean> {
        const [doctor, patient, employee] = await Promise.all([
            this.doctorModel.findOne({ email }),
            this.patientModel.findOne({ email }),
            this.employeeModel.findOne({ email })
        ])
        return !!(doctor || patient || employee)
    }

    async sendOtp(email: string) {
        if (await this.isEmailTaken(email)) {
            throw new BadRequestException("Email đã tồn tại trong hệ thống")
        }

        const existingOtp = await this.otpModel.findOne({ email })

        if (existingOtp) {
            if (existingOtp.isVerified) {
                throw new BadRequestException("Email đã được xác thực")
            }

            if (existingOtp.expiresAt > new Date()) {
                throw new BadRequestException("OTP vẫn còn hiệu lực, vui lòng kiểm tra email của bạn")
            }
        }

        const otp = randomInt(100000, 999999).toString()
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

        await this.otpModel.findOneAndUpdate(
            { email },
            { email, otp, expiresAt, isVerified: false },
            { upsert: true, new: true }
        )

        try {
            await axios.post(
                'https://api.resend.com/emails',
                {
                    from: 'onboarding@resend.dev',
                    to: email,
                    subject: "Mã xác thực OTP - TalkToDoc",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
                            <h2 style="color: #2E86C1;">Xác thực đăng ký tài khoản</h2>
                            <p>Xin chào,</p>
                            <p>Chúng tôi đã nhận được yêu cầu xác minh địa chỉ email của bạn trên <strong>TalkToDoc</strong>.</p>
                            <p style="font-size: 18px;">Mã OTP của bạn là:</p>
                            <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">${otp}</div>
                            <p>Mã này sẽ hết hạn sau <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                            <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
                            <hr />
                            <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} TalkToDoc. All rights reserved.</p>
                        </div>
                    `
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            )
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Gửi email OTP thất bại:", error.response?.data || error.message)
            } else {
                console.error("Gửi email OTP thất bại:", (error as Error).message)
            }
            throw new InternalServerErrorException("Không thể gửi OTP, vui lòng thử lại sau")
        }

        return { message: "OTP mới đã được gửi đến email của bạn" }
    }

    async verifyOtp(email: string, otp: string) {
        const record = await this.otpModel.findOne({ email, otp })

        if (!record) throw new BadRequestException("OTP không hợp lệ")
        if (record.isVerified) throw new BadRequestException("OTP đã được sử dụng")
        if (record.expiresAt < new Date()) throw new BadRequestException("OTP đã hết hạn")

        record.isVerified = true
        await record.save()

        return { message: "OTP đã được xác thực thành công" }
    }
}
