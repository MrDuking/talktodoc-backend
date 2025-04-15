import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailTemplateDto } from './dtos/mail-template.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-template')
  @ApiOperation({ summary: 'send email template' })
  async sendTemplate(@Body() dto: MailTemplateDto) {
    await this.mailService.sendTemplateMail(dto);
    return { message: 'Email sent using template' };
  }
}
