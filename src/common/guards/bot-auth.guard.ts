import { status } from "@grpc/grpc-js"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { RpcException } from "@nestjs/microservices"
import HandlerError from "src/utils/error-handler"
import { MESSAGE_CODES } from "../constants"

@Injectable()
export class BotControllerServiceGuard implements CanActivate {
    constructor(private configService: ConfigService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { apiKey, appId } = this.extractCredentialFromMetadata(context.getArgByIndex(1))

        try {
            if (apiKey !== this.configService.get<string>("BOT_CONTROLLER_SERVICE_API_KEY"))
                throw new HandlerError("api key is wrong!!", status.UNAUTHENTICATED, MESSAGE_CODES.BAD_REQUEST, "rpc")

            if (appId !== this.configService.get<string>("BOT_CONTROLLER_APP_ID")) {
                throw new HandlerError("service does not have required", status.UNAUTHENTICATED, MESSAGE_CODES.BAD_REQUEST, "rpc")
            }

            return true
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                details: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "Internal server error"
            })
        }
    }

    private extractCredentialFromMetadata(metadata: any): {
        apiKey: string
        appId: string
    } {
        const apiKey = metadata.get("x-api-key")[0] || ""
        const appId = metadata.get("x-app-id")[0] || ""

        return {
            apiKey,
            appId
        }
    }
}
