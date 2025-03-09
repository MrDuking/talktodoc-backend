import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  providers: [
    UsersService,
    {
      provide: 'UserServiceInterface',
      useClass: UsersService,
    },
  ],
  controllers: [UsersController],
  exports: [UsersService, 'UserServiceInterface'],
})
export class UsersModule {}
