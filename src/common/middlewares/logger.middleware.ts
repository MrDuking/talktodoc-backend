import { Inject, Injectable, NestMiddleware } from "@nestjs/common"
import { Request, Response } from "express"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"
import { Logger } from "winston"

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger

    use(request: Request, response: Response, next: () => void) {
        const { method, originalUrl } = request
        const userAgent = request.headers["user-agent"] || ""
        const ip = request.headers["X-Real-IP"] || ""
        const now = Date.now()
        const url = originalUrl.split("?")[0]

        this.logger.info(`Incoming Request - ${method} - ${url} - ${userAgent} ${ip}`)

        response.on("finish", () => {
            const { statusCode } = response
            const executeTime = Date.now() - now

            this.logger.info(`Outgoing Response - ${method} - ${url} - ${statusCode} - ${executeTime}ms - ${userAgent} ${ip}`)
        })

        next()
    }
}
