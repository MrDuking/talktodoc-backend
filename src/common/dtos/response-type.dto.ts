import { ApiResponseProperty } from "@nestjs/swagger"
import { Expose } from "class-transformer"
import { MESSAGE_CODES } from "../constants"

export class ResponseType<T = any> {
    @Expose()
    @ApiResponseProperty({ example: 200 })
    statusCode?: number

    @Expose()
    @ApiResponseProperty({ example: MESSAGE_CODES.SUCCESS })
    code: string

    @Expose()
    @ApiResponseProperty()
    data?: T

    @Expose()
    @ApiResponseProperty()
    message?: string

    constructor(partial: Partial<ResponseType<T>>) {
        Object.assign(this, partial)
    }
}
