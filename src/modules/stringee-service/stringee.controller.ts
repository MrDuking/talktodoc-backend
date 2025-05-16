import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { LocalAuthGuard } from '../auth/guards/local-auth.guard'
import { StringeeService } from './stringee.service'

@Controller('stringee')
export class StringeeController {
  constructor(private readonly stringeeService: StringeeService) {}

  @UseGuards(LocalAuthGuard)
  @Get('/token')
  getStringeeToken(@Req() req: any) {
    const userId = req.user.id
    console.log('userId', userId)
    const token = this.stringeeService.generateClientAccessToken(userId)
    return { token }
  }
}
