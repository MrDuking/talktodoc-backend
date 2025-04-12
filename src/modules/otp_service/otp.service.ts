import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailOtp } from './schemas/email-otp.schema';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

@Injectable()
export class OtpService {
  constructor(@InjectModel(EmailOtp.name) private otpModel: Model<EmailOtp>) {}

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendOtp(email: string) {
    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.otpModel.findOneAndUpdate(
      { email },
      { email, otp, expiresAt, isVerified: false },
      { upsert: true, new: true },
    );

    await this.transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'OTP Verification Code',
      text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
    });

    return { message: 'OTP sent to your email' };
  }

  async verifyOtp(email: string, otp: string) {
    const record = await this.otpModel.findOne({ email, otp });

    if (!record) throw new BadRequestException('Invalid OTP');
    if (record.isVerified) throw new BadRequestException('OTP already used');
    if (record.expiresAt < new Date()) throw new BadRequestException('OTP expired');

    record.isVerified = true;
    await record.save();

    return { message: 'OTP verified successfully' };
  }
}