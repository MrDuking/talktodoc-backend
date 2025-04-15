import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailService } from './mail.service';
import { EmailLog, EmailLogSchema } from './schemas/email-log.schema';
import { MailController } from './mail.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EmailLog.name, schema: EmailLogSchema }]),
  ],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
