import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendMail(fromEmail: string, name: string, message: string): Promise<void> {
    const mailOptions = {
      from: `"${name}" <${fromEmail}>`,
      to: process.env.CSKH_EMAIL,
      subject: `Request for patient assistance: ${name}`,
      text: message,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
