import { Module } from '@nestjs/common';
import { UsertitleModule } from 'src/user-title/user-title.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTitle } from 'src/user-title/user-title.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';

@Module({
  imports: [UsertitleModule, TypeOrmModule.forFeature([User, UserTitle])],
  controllers: [UserController],
  providers: [UserService, UsertitleModule],
  exports: [UserService],
})
export class UserModule {}
