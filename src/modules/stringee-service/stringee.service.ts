import { Injectable } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class StringeeService {
  generateClientAccessToken(userId: string): string {
    if (!process.env.STRINGEE_KEY_SECRET) {
      throw new Error('STRINGEE_KEY_SECRET is not configured')
    }

    if (!process.env.STRINGEE_KEY_SID) {
      throw new Error('STRINGEE_KEY_SID is not configured')
    }

    const now = Math.floor(Date.now() / 1000)
    const exp = now + 3600 // Token sống 1 giờ

    const payload = {
      jti: `${process.env.STRINGEE_KEY_SID}-${now}`,
      iss: process.env.STRINGEE_KEY_SID,
      exp: exp,
      userId: userId,
    }

    const token = jwt.sign(payload, process.env.STRINGEE_KEY_SECRET, {
      algorithm: 'HS256',
    })

    return token
  }
}
