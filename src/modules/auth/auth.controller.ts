import { Traceable } from "@amplication/opentelemetry-nestjs"
import { status } from "@grpc/grpc-js"
import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from "@nestjs/common"
import { GrpcMethod, RpcException } from "@nestjs/microservices"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { formatErrors, HandlerError, validateMessage } from "@utils"
import { AuthGuard, CurrentUser } from "src/common"
import { MESSAGE_CODES } from "src/common/constants"
import { AuthService } from "./auth.service"
import { LoginRequestDto, UserDto } from "./dtos"
import { ParsedUser } from "./dtos/parsed-user"
import { User } from "./interfaces"

@Controller("auth")
@ApiTags("Auth")
@Traceable()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("login")
    @UseGuards(AuthGuard)
    @ApiBearerAuth("access-token")
    async login(@Body() body: LoginRequestDto, @CurrentUser() user: ParsedUser) {
        try {
            return await this.authService.logIn(user, body)
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) {
                throw error
            }
            throw new HttpException(MESSAGE_CODES.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @GrpcMethod("UserService", "loginGrpc")
    async loginGrpc(data: User) {
        try {
            // validate message
            const errors = await validateMessage(data, UserDto)

            if (errors.length > 0) {
                throw new HandlerError(`Form Arguments invalid: ${formatErrors(errors)}`, status.INVALID_ARGUMENT, MESSAGE_CODES.INVALID_REQUEST, "rpc")
            }

            return await this.authService.logInGrpc(data)
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                details: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }
}
