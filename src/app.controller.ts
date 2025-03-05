import { Controller, Get } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ApiTags } from "@nestjs/swagger"
import { Public } from "./common/decorators/public.decorator"

@Controller("")
@ApiTags("Default")
export class AppController {
    constructor(private readonly configService: ConfigService) {}

    @Get()
    @Public()
    start() {
        return {
            statusCode: 200,
            data: new Date().toISOString() + " - VERSION: " + this.configService.get<string>("VERSION")
        }
    }
}
