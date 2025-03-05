import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Reflector } from "@nestjs/core"
import { RpcException } from "@nestjs/microservices"
import { ApplicationService } from "src/modules/application/application.service"

@Injectable()
export class ApplicationGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly applicationService: ApplicationService,
        private readonly configService: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        return true
        const request = context.switchToHttp().getRequest()
        const type = context.getType()

        let apiKey: string
        let appId: string

        if (type === "rpc") {
            // Handle RPC context
            const metadata = context.switchToRpc().getContext().internalRepr
            if (!metadata || !metadata.get("x-api-key") || !metadata.get("x-app-id")) {
                throw new RpcException("Invalid application call")
            }
            apiKey = metadata.get("x-api-key")[0]
            appId = metadata.get("x-app-id")[0]
        } else if (type === "http") {
            return true
            // Handle HTTP context
            apiKey = request.headers["x-api-key"] as string
            appId = request.headers["x-app-id"] as string
        } else {
            throw new Error("Unsupported request type")
        }

        if (!apiKey || !appId) {
            throw new Error("Missing x-api-key or x-app-id")
        }

        await this.validateApplication(appId, apiKey)
        const application = await this.applicationService.getApplicationById(appId)
        context.switchToRpc().getContext().serviceName = application?.serviceName
        return true
    }

    private async validateApplication(appId: string, apiKey: string): Promise<boolean> {
        try {
            const application = await this.applicationService.getApplicationById(appId)

            if (!application) {
                throw new Error("Application not found")
            }

            if (apiKey !== this.configService.get<string>("API_KEY")) {
                throw new Error("Invalid api-key")
            }

            return true
        } catch (error) {
            throw new Error(error.message || "Failed to validate application")
        }
    }
}
