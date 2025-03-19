import { Body, Controller, HttpCode, HttpStatus, Post, UnauthorizedException, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { LoginDto } from "./dtos/index"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import { AuthService } from "./index"

@ApiTags("auth")
@Controller("api/v1/auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: "Login and get JWT token" })
    @ApiResponse({ status: 201, description: "Login successful. Returns JWT token." })
    @ApiResponse({ status: 401, description: "Unauthorized. Invalid credentials." })
    @ApiBody({ type: LoginDto })
    @UseGuards(LocalAuthGuard)
    @Post("login")
    @HttpCode(HttpStatus.CREATED)
    async login(@Body() loginDto: LoginDto) {
        try {
            return await this.authService.login(loginDto)
        } catch (error: any) {
            console.error("Error in login:", error.message)
            throw new UnauthorizedException("Invalid login credentials")
        }
    }

    @ApiOperation({ summary: "Logout user" })
    @ApiResponse({ status: 200, description: "Logout successful." })
    @ApiBearerAuth()
    @Post("logout")
    @HttpCode(HttpStatus.OK)
    async logout() {
        return { message: "Logout successful" }
    }
}
