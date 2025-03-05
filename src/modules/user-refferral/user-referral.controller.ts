import { status } from "@grpc/grpc-js"
import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseInterceptors } from "@nestjs/common"
import { GrpcMethod, RpcException } from "@nestjs/microservices"
import { ApiTags } from "@nestjs/swagger"
import { formatErrors, HandlerError, validateMessage } from "@utils"
import { SerializerGrpcMethodInterceptor } from "src/common"
import { MESSAGE_CODES } from "src/common/constants"
import { CreateUserReferralRequestDto, GetRefByMessage, GetRefByRequestDto, GetReferralsRequestDto, GetUserIDsRequestDto } from "./dtos"
import { GetRefBy } from "./interfaces"
import { UserReferralService } from "./user-referral.service"

@Controller("user-referral")
@ApiTags("User Referral")
export class UserReferralController {
    constructor(private readonly userReferralService: UserReferralService) {}

    @Post()
    async createReferral(@Body() referralData: CreateUserReferralRequestDto) {
        return this.userReferralService.createReferral(referralData)
    }

    @Get("ref-by")
    async getRefBy(@Query() query: GetRefByRequestDto) {
        try {
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: await this.userReferralService.getRefBy(query.userId, query.server)
            }
        } catch (error) {
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Get("referrals")
    async getReferrals(@Query() query: GetReferralsRequestDto) {
        try {
            const { userId, server, startDate, endDate, page, take } = query
            const filter: any = {}

            if (userId) filter.refBy = userId
            if (server !== undefined) filter.server = Number(server)

            if (startDate || endDate) {
                filter.refTime = {}
                if (startDate) {
                    filter.refTime.start = startDate
                }
                if (endDate) {
                    filter.refTime.end = endDate
                }
            }

            const result = await this.userReferralService.getReferrals(filter, page, take)

            return {
                code: MESSAGE_CODES.SUCCESS,
                data: result
            }
        } catch (error) {
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Get("ref-time")
    async getRefTime(@Query("userId") userId: string, @Query("server") server: number) {
        try {
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: await this.userReferralService.getRefTime(userId, server)
            }
        } catch (error) {
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Get("user-ids")
    async getuserIdsByServer(@Query() query: GetUserIDsRequestDto) {
        try {
            const { server, page, take } = query
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: await this.userReferralService.getuserIdsByServer(server, page, take)
            }
        } catch (error) {
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @Get("query")
    async getDataByQuery(@Query("userId") userId?: string, @Query("refBy") refBy?: string, @Query("server") server?: number) {
        try {
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: await this.userReferralService.getDataByQuery({ userId, refBy, server })
            }
        } catch (error) {
            throw new HttpException("internal server error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    // NOTE: (@hhman24) Grpc method
    @GrpcMethod("UserReferralService", "getRefBy")
    @UseInterceptors(SerializerGrpcMethodInterceptor())
    async getRefByGrpc(data: GetRefBy) {
        try {
            // validate message
            const errors = await validateMessage(data, GetRefByMessage)

            if (errors.length > 0) {
                throw new HandlerError(`Form Arguments invalid: ${formatErrors(errors)}`, status.INVALID_ARGUMENT, MESSAGE_CODES.INVALID_REQUEST, "rpc")
            }

            return await this.userReferralService.getRefByGrpcMethod(data.userId, data.server)
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                details: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }
}
