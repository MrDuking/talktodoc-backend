import { status } from "@grpc/grpc-js"
import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards } from "@nestjs/common"
import { GrpcMethod, RpcException } from "@nestjs/microservices"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { formatErrors, HandlerError, validateMessage } from "@utils"
import { ApiOkPaginationResponseCustom, AuthGuard, CurrentUser, ResponseType } from "src/common"
import { MESSAGE_CODES } from "src/common/constants"
import { ParsedUser } from "../auth/dtos/parsed-user"
import { FindUserByRefCodeDto, GetReferralQuery, UpdateUserAvatarDto, UpdateUserPreniumDto, UpdateUserRefByDto, UpdateUserTotalQuestPoint, UpdateWalletAddressDto } from "./dtos"
import { GetUsersRequestDto } from "./dtos/get-users-request-dto"
import { GetReferralPagingResponse, GetReferralResponse } from "./dtos/referral-response.dto"
import { FindUserRefCodeMessage, UpdateUserAvatarMessage, UpdateUserPreniumMessage, UpdateUserRefByMessage, UserIdMessage } from "./interfaces"
import { UserService } from "./user.service"

@Controller("user")
@ApiTags("User")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("profile")
    @UseGuards(AuthGuard)
    @ApiBearerAuth("access-token")
    async getUser(@CurrentUser() user: ParsedUser) {
        const userId: string | undefined = user.id.toString()
        if (!userId) {
            throw new HttpException(MESSAGE_CODES.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR)
        }
        try {
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: await this.userService.findUser(userId)
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new HttpException(MESSAGE_CODES.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Post("wallet-address")
    @UseGuards(AuthGuard)
    @ApiBearerAuth("access-token")
    async setWalletAddress(@CurrentUser() user: ParsedUser, @Body() data: UpdateWalletAddressDto) {
        const userId: string | undefined = user.id.toString()
        if (!userId) {
            throw new HttpException(MESSAGE_CODES.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR)
        }
        try {
            return {
                code: MESSAGE_CODES.SUCCESS,
                data: await this.userService.updateUserWalletAddress(userId, data.walletAddress)
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new HttpException(MESSAGE_CODES.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get("referrals")
    @UseGuards(AuthGuard)
    @ApiBearerAuth("access-token")
    @ApiOkPaginationResponseCustom(ResponseType, GetReferralPagingResponse, GetReferralResponse)
    async getReferrals(@CurrentUser() user: ParsedUser, @Query() query: GetReferralQuery) {
        try {
            const userId: string | undefined = user.id.toString()

            return await this.userService.getUserReferrals(userId, query)
        } catch (error) {
            throw new HttpException(error?.message || "internal server error", error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: {
                    code: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                    message: error
                }
            })
        }
    }

    @GrpcMethod("UserService", "getAllUsers")
    async findAll(data: GetUsersRequestDto) {
        const { name, userId, page, take } = data
        const filter: any = {}
        if (name) {
            filter["name"] = { $regex: new RegExp(name, "i") }
        }

        if (userId) {
            filter["id"] = { $regex: new RegExp(userId, "i") }
        }
        try {
            const result = await this.userService.findAll(filter, page, take)
            return {
                data: result,
                code: MESSAGE_CODES.SUCCESS
            }
        } catch (error) {
            throw new RpcException({
                code: status.INTERNAL,
                message: MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }

    @GrpcMethod("UserService", "getUserById")
    async findOne(data: { userId: string }) {
        try {
            const user = await this.userService.findUserWithInventory(data.userId)
            return {
                data: user ? user : null,
                code: MESSAGE_CODES.SUCCESS
            }
        } catch (error) {
            throw new RpcException({
                code: status.INTERNAL,
                message: MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }

    @GrpcMethod("UserService", "findUserById")
    async findUserById(data: { userId: string }) {
        try {
            const user = await this.userService.findUser(data.userId)
            return {
                data: user ? user : null,
                code: MESSAGE_CODES.SUCCESS
            }
        } catch (error) {
            throw new RpcException({
                code: status.INTERNAL,
                message: MESSAGE_CODES.INTERNAL_SERVER_ERROR
            })
        }
    }

    @GrpcMethod("UserService", "getListUserId")
    async findAllUserIds() {
        try {
            return await this.userService.findAllUserId()
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                details: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }

    @GrpcMethod("UserService", "updateUserPrenium")
    async updateUserPrenium(data: UpdateUserPreniumMessage) {
        try {
            // validate message
            const errors = await validateMessage(data, UpdateUserPreniumDto)

            if (errors.length > 0) {
                throw new HandlerError(`Form Arguments invalid: ${formatErrors(errors)}`, status.INVALID_ARGUMENT, MESSAGE_CODES.INVALID_REQUEST, "rpc")
            }

            return await this.userService.updateUserPrenium(data.userId, data.isTelegramPremiumUser)
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                details: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }

    @GrpcMethod("UserService", "updateUserAvatar")
    async updateUserAvatar(data: UpdateUserAvatarMessage) {
        try {
            // validate message
            const errors = await validateMessage(data, UpdateUserAvatarDto)

            if (errors.length > 0) {
                throw new HandlerError(`Form Arguments invalid: ${formatErrors(errors)}`, status.INVALID_ARGUMENT, MESSAGE_CODES.INVALID_REQUEST, "rpc")
            }

            return await this.userService.updateUserAvatar(data.userId, data.avatar)
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                details: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }

    @GrpcMethod("UserService", "updateUserRefBy")
    async updateUserRefBy(data: UpdateUserRefByMessage) {
        try {
            // validate message
            const errors = await validateMessage(data, UpdateUserRefByDto)

            if (errors.length > 0) {
                throw new HandlerError(`Form Arguments invalid: ${formatErrors(errors)}`, status.INVALID_ARGUMENT, MESSAGE_CODES.INVALID_REQUEST, "rpc")
            }

            return await this.userService.updateUserRefBy(data.userId, data.refBy)
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                details: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }

    @GrpcMethod("UserService", "findUserByRefCode")
    async findUserByRefCode(data: FindUserRefCodeMessage) {
        try {
            // validate message
            const errors = await validateMessage(data, FindUserByRefCodeDto)

            if (errors.length > 0) {
                throw new HandlerError(`Form Arguments invalid: ${formatErrors(errors)}`, status.INVALID_ARGUMENT, MESSAGE_CODES.INVALID_REQUEST, "rpc")
            }

            return await this.userService.findUserByRefCode(data.refCode)
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                details: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }

    @GrpcMethod("UserGameInfoService", "increaseQuestPointGrpc")
    async increaseQuestPointGrpc(data: UserIdMessage) {
        try {
            // validate message
            const errors = await validateMessage(data, UpdateUserTotalQuestPoint)

            if (errors.length > 0) {
                throw new HandlerError(`Form Arguments invalid: ${formatErrors(errors)}`, status.INVALID_ARGUMENT, MESSAGE_CODES.INVALID_REQUEST, "rpc")
            }

            return await this.userService.increaseQuestPointGrpc(data.userId)
        } catch (error) {
            throw new RpcException({
                code: error?.statusCode || status.INTERNAL,
                details: error?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
                message: error?.message || "internal server error"
            })
        }
    }
}
