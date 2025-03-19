import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../user-service/user.service";
import { LoginDto } from "./dtos/login.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.findByUsername(username);
        if (!user) throw new UnauthorizedException("User not found");

        console.log("Stored password in DB:", user.password);
        console.log("Entered password:", password);

        if (password !== user.password) {
            throw new UnauthorizedException("Invalid password");
        }

        const { password: _, ...result } = user;
        return result;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.username, loginDto.password);
        const payload = { username: user.username, sub: user._id, role: user.role };
        return { access_token: this.jwtService.sign(payload) };
    }
}
