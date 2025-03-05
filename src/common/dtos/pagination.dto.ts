import { ApiPropertyOptional, ApiResponseProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator"
import { SortDirection } from "../enums"
// import { SortDirection } from "../enums"

export class PageOptionsDto {
    @ApiPropertyOptional({ minimum: 1, default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    readonly page: number = 1

    @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    @IsOptional()
    readonly take: number = 10

    @ApiPropertyOptional({ enum: SortDirection, default: SortDirection.DESC })
    @IsEnum(SortDirection)
    @IsOptional()
    readonly sortDirection: SortDirection = SortDirection.DESC

    @ApiPropertyOptional({ default: "createdAt" })
    @IsOptional()
    readonly sort: string = "createdAt"
}

export class PageMetaResponseDtoParameters {
    pageOptionsDto: PageOptionsDto
    itemCount: number
}

export class PageMetaDto {
    constructor({ pageOptionsDto, itemCount }: PageMetaResponseDtoParameters) {
        this.page = +pageOptionsDto.page
        this.take = +pageOptionsDto.take
        this.totalPage = Math.ceil(itemCount / pageOptionsDto.take)
        this.hasPreviousPage = this.page > 1
        this.hasNextPage = this.page <= this.totalPage
    }

    @ApiResponseProperty()
    page: number

    @ApiResponseProperty()
    take: number

    @ApiResponseProperty()
    totalPage: number

    @ApiResponseProperty()
    hasPreviousPage: boolean

    @ApiResponseProperty()
    hasNextPage: boolean
}

export class PageDto<T> {
    @ApiResponseProperty()
    readonly items: T[]

    @ApiResponseProperty({ type: () => PageMetaDto })
    readonly meta: PageMetaDto

    constructor(items: T[], meta: PageMetaDto) {
        this.items = items
        this.meta = meta
    }
}
