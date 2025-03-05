import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { UserRefferalRepository } from "./repositories"
import { UserReferral, UserReferralSchema } from "./schemas"
import { UserReferralController } from "./user-referral.controller"
import { UserReferralService } from "./user-referral.service"

@Module({
    imports: [MongooseModule.forFeature([{ name: UserReferral.name, schema: UserReferralSchema }])],
    providers: [UserReferralService, UserRefferalRepository],
    controllers: [UserReferralController]
})
export class UserReferralModule {}
