import { ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { ThrottlerGuard, ThrottlerOptions } from "@nestjs/throttler"
import { MESSAGE_CODES } from "../constants"

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        return req.ips.length ? req.ips[0] : req.ip // individualize IP extraction to meet your own needs
    }

    async handleRequest(context: ExecutionContext, limit: number, ttl: number, throttler: ThrottlerOptions): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const ip = await this.getTracker(request)
        const key = this.generateKey(context, ip, throttler.name!)
        const { totalHits } = await this.storageService.increment(key, ttl)

        if (totalHits > limit) {
            throw new HttpException("You are being rate limited", HttpStatus.TOO_MANY_REQUESTS, {
                cause: {
                    code: MESSAGE_CODES.T0O_MANY_REQUESTS
                }
            })
        }

        return true
    }
}
