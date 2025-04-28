import { Controller, Post, Body } from '@nestjs/common';
import { CallService } from './call.service';

@Controller('webhook')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post('/stringee')
  handleStringeeWebhook(@Body() payload: any) {
    return this.callService.processWebhook(payload);
  }
}