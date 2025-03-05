import { HttpModule } from "@nestjs/axios"
import { Global, Module } from "@nestjs/common"
import { UserModule } from "../user/user.module"
import { AuthController } from "./auth.controller"
import { AuthRepository } from "./auth.repository"
import { AuthService } from "./auth.service"

@Global()
@Module({
    imports: [UserModule, HttpModule],
    controllers: [AuthController],
    providers: [AuthService, AuthRepository]
})
export class AuthModule {}
