import { RedisModule } from '@liaoliaots/nestjs-redis'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MedicineController } from './medicines.controller'
import { MedicineService } from './medicines.service'
import { Medicine, MedicineSchema } from './schemas/medicines.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Medicine.name, schema: MedicineSchema }]),
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [MedicineController],
  providers: [MedicineService],
})
export class MedicineModule {}
