import { Injectable } from '@nestjs/common'

@Injectable()
export class CallService {
  processWebhook(payload: any) {
    return { status: 'received' }
  }
}
