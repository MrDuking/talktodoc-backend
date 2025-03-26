import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../user-service/user.service";
import { LoginDto } from "./dtos/login.dto";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { BaseUser } from "../user-service/schemas/base-user.schema";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(identifier: string, password: string): Promise<any> {
    const user = await this.usersService["baseUserModel"].findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { phoneNumber: identifier }
      ]
    }).lean();

    if (!user) throw new UnauthorizedException("User not found");

    console.log("Stored password in DB:", user.password);
    console.log("Entered password:", password);

    if (user.password !== password) {
      throw new UnauthorizedException("Invalid password");
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.identifier, loginDto.password);
    const payload = { username: user.username, sub: user._id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(dto: RegisterUserDto): Promise<BaseUser> {
    const { username, email, phoneNumber, password } = dto;

    const existing = await this.usersService["baseUserModel"].findOne({
      $or: [{ username }, { email }, { phoneNumber }]
    });

    if (existing) {
      throw new UnauthorizedException("User already exists");
    }

    const newUser = new this.usersService["baseUserModel"]({
      username,
      email,
      phoneNumber,
      password // khum mã hóa
    });

    return newUser.save();
  }
}
