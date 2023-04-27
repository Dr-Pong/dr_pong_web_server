import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTitle } from './user-title.entity';
import { UserTitleService } from './user-title.service';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/user.entity';
import { Title } from 'src/title/title.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserTitle, Title])],
  providers: [UserTitleService],
  exports: [TypeOrmModule.forFeature([User, UserTitle, Title]), UserTitleService],
})
export class UsertitleModule {}
