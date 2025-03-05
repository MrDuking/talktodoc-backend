import { status } from "@grpc/grpc-js"
import { HttpService } from "@nestjs/axios"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { AxiosError } from "axios"
import { catchError, firstValueFrom } from "rxjs"
import { ResponseType } from "src/common"
import { User } from "../../common/schemas/user.schema"
import { UserService } from "../user/user.service"
import { MESSAGE_CODES } from "./../../common/constants/index"
import { AuthRepository } from "./auth.repository"
import { LoginRequestDto } from "./dtos"
import { ParsedUser } from "./dtos/parsed-user"
@Injectable()
export class AuthService {
    constructor(
        private authRepository: AuthRepository,
        private readonly httpService: HttpService,
        private userSerivce: UserService,
        private readonly configService: ConfigService
    ) {}

    async logIn(user: ParsedUser, request: LoginRequestDto): Promise<{ data: User; code: string }> {
        const userFormatData: any = {
            ...user
        }
        userFormatData.isTelegramPremiumUser = request.is_premium as boolean
        userFormatData.id = user?.id.toString() || ""
        userFormatData.name = user?.firstName || ""
        userFormatData.refBy = request.refBy || ""
        if (user?.lastName) {
            userFormatData.name = `${user.firstName} ${user.lastName}`
        }
        const findUser = await this.authRepository.login(userFormatData as User)
        if (!findUser.isRegisteredPayment) {
            await this.registerPayment(findUser.id)
            await this.userSerivce.updateRegisterPaymentStatus(findUser.id, true)
        }
        return { data: findUser, code: MESSAGE_CODES.SUCCESS }
    }

    async logInGrpc(user: User): Promise<ResponseType<User>> {
        try {
            const findUser = await this.authRepository.login(user)

            return { data: findUser, code: MESSAGE_CODES.SUCCESS, statusCode: status.OK }
        } catch (error) {
            throw error
        }
    }

    async registerPayment(userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService
                    .post(
                        this.configService.get<string>("TON_TRACKING_SERVICE_URL") + "/users" || "",
                        {
                            userId
                        },
                        {
                            headers: {
                                Authorization: "Bearer " + this.configService.get<string>("TON_TRACKING_SERVICE_BEARER")
                            }
                        }
                    )
                    .pipe(
                        catchError((error: AxiosError) => {
                            throw new Error(`Request failed: ${error.message}`)
                        })
                    )
            )
            return response.data.data
        } catch (e) {
            throw new Error("Cannot get token address: " + e.message)
        }
    }
}
