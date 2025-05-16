import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ContactService } from './contact.service'
import { SendContactEmailDto } from './dtos/send-contact-email.dto'

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Send email for CSKH' })
  @ApiResponse({ status: 200, description: 'Send email complete.' })
  async sendContactEmail(@Body() dto: SendContactEmailDto) {
    await this.contactService.sendMail(dto.email, dto.name, dto.message)
    return { message: 'Send email complete.' }
  }
}
