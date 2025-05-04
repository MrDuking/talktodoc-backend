import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class UpdateFormConfigDto {
  @ApiProperty({
    description: "Raw JSON string chứa nội dung của general_setting",
    example: JSON.stringify({
      form_json: {},
      COUPON_CODE: {},
    }),
  })
  @IsString()
  general_setting!: string;
}