import { AuthModule } from '@/modules/auth/auth.module'
import { MedicineModule } from '@/modules/medicines_service/medicines.module'
import { Medicine, MedicineSchema } from '@/modules/medicines_service/schemas/medicines.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CaseController } from './case.controller'
import { CaseService } from './case.service'
import { Case, CaseSchema } from './schemas/case.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Case.name, schema: CaseSchema },
      { name: Medicine.name, schema: MedicineSchema },
    ]),
    MedicineModule,
    AuthModule,
  ],
  controllers: [CaseController],
  providers: [CaseService],
  exports: [CaseService],
})
export class CaseModule {}
