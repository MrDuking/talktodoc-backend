import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailTemplateDto } from './dtos/mail-template.dto';
import { EmailLog } from './schemas/email-log.schema';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectModel(EmailLog.name)
    private readonly emailLogModel: Model<EmailLog>,
  ) {}

  // Gmail SMTP config
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // sned email template
  async sendTemplateMail(dto: MailTemplateDto): Promise<void> {
    const { to, subject, template, variables } = dto;

    try {
      const html = this.renderTemplate(template, variables);

      await this.transporter.sendMail({
        from: `"TalkToDoc" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });

      await this.emailLogModel.create({
        to,
        subject,
        html,
        success: true,
      });

      this.logger.log(`✅ Email sent to ${to} | Template: ${template}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to send email to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`);

      await this.emailLogModel.create({
        to,
        subject,
        html: '',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  // read and render conetent template HTML
  private renderTemplate(templateName: string, variables: Record<string, any>): string {
    const filePath = path.join(__dirname, 'templates', `${templateName}.html`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Template "${templateName}" not found`);
    }

    const templateContent = fs.readFileSync(filePath, 'utf-8');
    const compiled = handlebars.compile(templateContent);
    return compiled(variables);
  }
}
