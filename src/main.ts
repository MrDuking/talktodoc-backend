import { ReflectionService } from "@grpc/reflection"
import { ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { join } from "path"
import { AppModule } from "src/app.module"
import { PAKAGES } from "./common"
import { setupSwagger } from "./configs"

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const configService = app.get(ConfigService)

    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.GRPC,
            options: {
                package: ["user", "user_game_info", "leaderboard", "inventory_item", PAKAGES.USER_INVENTORY, PAKAGES.USER_REFERRAL],
                protoPath: [
                    join(__dirname, "..", "protos", "user.proto"),
                    join(__dirname, "..", "protos", "user_game_info.proto"),
                    join(__dirname, "..", "protos", "user_inventory.proto"),
                    join(__dirname, "..", "protos", "leaderboard.proto"),
                    join(__dirname, "..", "protos", "user_referral.proto"),
                    join(__dirname, "..", "protos", "inventory_item.proto")
                ],
                onLoadPackageDefinition(pkg, server) {
                    new ReflectionService(pkg).addToServer(server)
                },

                url: configService.get("GRPC_URL")
            }
        },
        { inheritAppConfig: true }
    )

    //pipe
    app.useGlobalPipes(new ValidationPipe({ transform: true }))

    app.enableCors({
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        origin: "*"
    })

    //swagger
    setupSwagger(app)

    //start app and microservices
    await app.startAllMicroservices()
    await app.listen(configService.get("PORT")!, "0.0.0.0")
    console.log(`${configService.get("SERVICE_NAME")} is running on: ${await app.getUrl()}`)
    console.log(`gRPC service is running on: ${configService.get<string>("GRPC_URL")}`)
}

bootstrap()
