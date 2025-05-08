import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
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

  async sendTemplateMail(dto: MailTemplateDto): Promise<void> {
    const { to, subject, template, variables } = dto;
    const html = this.renderTemplate(template, variables);

    try {
      await axios.post(
        'https://api.resend.com/emails',
        {
          from: 'noreply@talktodoc.online',
          to,
          subject,
          html,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await this.emailLogModel.create({
        to,
        subject,
        html,
        success: true,
      });

      this.logger.log(` Email sent to ${to} | Template: ${template}`);
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error.message || 'Unknown error';
      this.logger.error(` Failed to send email to ${to}: ${errMsg}`);

      await this.emailLogModel.create({
        to,
        subject,
        html,
        success: false,
        errorMessage: errMsg,
      });

      throw new Error(`Failed to send email: ${errMsg}`);
    }
  }

  private renderTemplate(templateName: string, variables: Record<string, any>): string {
    const filePath = path.join(process.cwd(), 'src', 'modules', 'mail', 'templates', `${templateName}.html`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Template "${templateName}" not found`);
    }

    const templateContent = fs.readFileSync(filePath, 'utf-8');
    const compiled = handlebars.compile(templateContent);
    return compiled(variables);
  }
}
