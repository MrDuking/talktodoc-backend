import { NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { AppModule } from "./app.module"
async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    const config = new DocumentBuilder()
        .setTitle("TalkToDoc API")
        .setDescription("API documentation for TalkToDoc")
        .setVersion("1.0")
        .addBearerAuth(
            {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            },
            "access-token"
        )
        .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("api/docs", app, document)

    app.enableCors()

    // app.setGlobalPrefix("api/v1")
    app.use((err: any, req: any, res: any, next: any) => {
        console.error("Error:", err)
        next()
    })
    await app.listen(3000)
    console.log(`Server is running on http://localhost:3000`)
    console.log(`Swagger UI is available on http://localhost:3000/api/docs`)
}

bootstrap()
