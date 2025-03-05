import { PageOptionsDto } from "src/common/dtos"

export class GetUsersRequestDto extends PageOptionsDto {
    name?: string
    userId?: string
}
