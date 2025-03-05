import { forwardRef, Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { User, UserSchema } from "src/common/schemas"
import { LeaderboardModule } from "../leaderboard/leaderboard.module"
import { UserGameInfoModule } from "../user-game-info/user-game-info.module"
import { UserInventoryModule } from "../user-inventory/user-inventory.module"
import { UserRepository } from "./repositories"
import { UserController } from "./user.controller"
import { UserService } from "./user.service"

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), forwardRef(() => LeaderboardModule), forwardRef(() => UserGameInfoModule), UserInventoryModule],
    controllers: [UserController],
    providers: [UserService, UserRepository],
    exports: [UserService, UserRepository]
})
export class UserModule {}
