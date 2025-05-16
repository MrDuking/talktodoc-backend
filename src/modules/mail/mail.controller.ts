import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { MailTemplateDto } from './dtos/mail-template.dto'
import { MailService } from './mail.service'

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-template')
  @ApiOperation({ summary: 'send email template' })
  async sendTemplate(@Body() dto: MailTemplateDto) {
    await this.mailService.sendTemplateMail(dto)
    return { message: 'Email sent using template' }
  }
}
