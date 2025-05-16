import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import mongoose from 'mongoose'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT') || 3000
  const mongoUri = configService.get<string>('MONGODB_URI')
  const dbName = configService.get<string>('DB_NAME')

  mongoose.connection.on('connected', () => {
    console.log(` Connected to MongoDB: ${mongoUri}/${dbName}`)
  })

  mongoose.connection.on('error', err => {
    console.error(' MongoDB Connection Error:', err)
  })

  const config = new DocumentBuilder()
    .setTitle('TalkToDoc API')
    .setDescription('API documentation for TalkToDoc')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  app.enableCors()

  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error:', err)
    next()
  })

  await app.listen(port)
  console.log(`Server is running on http://localhost:${port}`)
  console.log(`Swagger UI: http://localhost:${port}/api/docs`)
}

bootstrap()
