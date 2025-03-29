import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { LoginDto } from "./dtos/index"
import { RegisterUserDto } from "./dtos/register-user.dto"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import { AuthService } from "./index"

@ApiTags("auth")
@Controller("api/v1/auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: "Login and get JWT token" })
    @UseGuards(LocalAuthGuard)
    @Post("login")
    @HttpCode(HttpStatus.CREATED)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }

    @ApiOperation({ summary: "Register base user" })
    @Post("register")
    async register(@Body() dto: RegisterUserDto) {
        return this.authService.register(dto)
    }

    @ApiOperation({ summary: "Logout user" })
    @Post("logout")
    @HttpCode(HttpStatus.OK)
    async logout() {
        return { message: "Logout successful" }
    }
}
