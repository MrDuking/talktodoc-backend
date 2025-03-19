import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Default')
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  checkStatus() {
    return {
      statusCode: 200,
      message: 'Server is running!',
      data: new Date().toISOString() + ' - VERSION: ' + this.configService.get<string>('VERSION'),
    };
  }
}