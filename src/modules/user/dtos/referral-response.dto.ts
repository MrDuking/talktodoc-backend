import { ApiResponseProperty } from "@nestjs/swagger"
import { Exclude, Expose } from "class-transformer"
import { PageDto } from "src/common"

@Exclude()
export class GetReferralResponse {
    @Expose()
    @ApiResponseProperty()
    id: string

    @Expose()
    @ApiResponseProperty()
    name: string

    @Expose()
    @ApiResponseProperty()
    refTime: string

    @Expose()
    @ApiResponseProperty()
    countryCode: string

    @Expose()
    @ApiResponseProperty()
    playTime: number

    @Expose()
    @ApiResponseProperty()
    avatar: string
}

export class GetReferralPagingResponse<T> extends PageDto<T> {
    @Expose()
    @ApiResponseProperty()
    totalLutonEarnedByInvite: number

    @Expose()
    @ApiResponseProperty()
    totalFriendInvited: number
}
