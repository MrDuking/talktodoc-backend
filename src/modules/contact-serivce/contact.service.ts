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
    const sanitizedMessage = message.replace(/\n/g, '<br>');

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: #333; line-height: 1.6;">
        <table style="width: 100%; margin-top: 10px;">
          <tr>
            <td style="padding: 6px 0;"><strong>👤 Họ tên:</strong></td>
            <td>${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><strong>📧 Email:</strong></td>
            <td><a href="mailto:${fromEmail}">${fromEmail}</a></td>
          </tr>
        </table>

        <div style="margin-top: 20px;">
          <p style="font-weight: bold; margin-bottom: 8px;">📝 Nội dung chi tiết:</p>
          <div style="background-color: #f9f9f9; border-left: 4px solid #2F80ED; padding: 15px 20px; border-radius: 6px; color: #444;">
            ${sanitizedMessage}
          </div>
        </div>

        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">📣 Đây là email tự động từ hệ thống TalkToDoc. Vui lòng không trả lời trực tiếp.</p>
      </div>
    `;

    const mailOptions = {
      from: `"TalkToDoc - ${name}" <${fromEmail}>`,
      to: process.env.CSKH_EMAIL,
      subject: `📥 Yêu cầu hỗ trợ từ khách hàng: ${name}`,
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
  }
}