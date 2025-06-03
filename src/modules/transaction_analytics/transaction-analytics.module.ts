import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppointmentModule } from '../appointments_service/appointment.module'
import { Appointment, AppointmentSchema } from '../appointments_service/schemas/appointment.schema'
import { DoctorRevenue, DoctorRevenueSchema } from './schemas/doctor-revenue.schema'
import { RevenueAnalytics, RevenueAnalyticsSchema } from './schemas/revenue-analytics.schema'
import { Transaction, TransactionSchema } from './schemas/transaction.schema'
import { TransactionAnalyticsController } from './transaction-analytics.controller'
import { TransactionAnalyticsService } from './transaction-analytics.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: DoctorRevenue.name, schema: DoctorRevenueSchema },
      { name: RevenueAnalytics.name, schema: RevenueAnalyticsSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    AppointmentModule,
  ],
  controllers: [TransactionAnalyticsController],
  providers: [TransactionAnalyticsService],
  exports: [TransactionAnalyticsService],
})
export class TransactionAnalyticsModule {}
