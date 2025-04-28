import { Injectable } from '@nestjs/common';

@Injectable()
export class CallService {
  processWebhook(payload: any) {
    console.log('Webhook Stringee:', payload);
    return { status: 'received' };
  }
}