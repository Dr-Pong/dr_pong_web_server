import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTitle } from './user-title.entity';
import { UserTitleService } from './user-title.service';
import { User } from 'src/user/user.entity';
import { Title } from 'src/title/title.entity';
import { UserTitleRepository } from './user-title.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserTitle])],
  providers: [UserTitleService, UserTitleRepository],
  exports: [UserTitleService],
})
export class UsertitleModule {}
