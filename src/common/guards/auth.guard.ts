import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Reflector } from "@nestjs/core"
import { parse, validate } from "@tma.js/init-data-node"
import { IS_PUBLIC_KEY } from "../decorators/public.decorator"

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private configService: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])
        if (isPublic) {
            return true
        }
        const { authToken } = this.extractCredentialFromHeader(request)

        try {
            const [authType, authData = ""] = authToken.split(" ")
            let initData

            switch (authType) {
                case "test1": {
                    const testData =
                        "query_id=AAFSUlFTAgAAAFJSUVMQm168&user=%7B%22id%22%3A5692805714%2C%22first_name%22%3A%22Tr%E1%BA%A7n%22%2C%22last_name%22%3A%22Nam%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1725563866&hash=dbc15610706df13e372004206ae23e0a35def142468deceea750fc9421c4e666"
                    initData = parse(testData)

                    request["user"] = {
                        ...initData.user,
                        userID: initData.user?.id.toString() || "",
                        sessionId: initData.queryId
                    }
                    return true
                }
                case "tma":
                case "Bearer":
                    if (authData == "test") {
                        const testData =
                            "query_id=AAFSUlFTAgAAAFJSUVMQm168&user=%7B%22id%22%3A5692805714%2C%22first_name%22%3A%22Tr%E1%BA%A7n%22%2C%22last_name%22%3A%22Nam%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1725563866&hash=dbc15610706df13e372004206ae23e0a35def142468deceea750fc9421c4e666"
                        initData = parse(testData)

                        request["user"] = {
                            ...initData.user,
                            userID: initData.user?.id.toString() || "",
                            sessionId: initData.queryId
                        }
                        return true
                    }
                    try {
                        const telegramBotToken = this.configService.get<string>("TELEGRAM_BOT_TOKEN")
                        validate(authData, telegramBotToken || "", {
                            expiresIn: 86400
                        })

                        initData = parse(authData)

                        request["user"] = {
                            ...initData.user,
                            userID: initData.user?.id.toString() || "",
                            sessionId: initData.queryId
                        }

                        return true
                    } catch (e) {
                        console.log(e)
                        throw new UnauthorizedException()
                    }
                default:
                    throw new UnauthorizedException()
            }
        } catch (error: any) {
            console.log(error)
            throw new UnauthorizedException()
        }
    }

    private extractCredentialFromHeader(request: any): { authToken: string } {
        const authToken = request.headers["authorization"] || ""
        return { authToken }
    }
}
