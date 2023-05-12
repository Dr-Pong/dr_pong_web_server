import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTitle } from './user-title.entity';
import { UserTitleService } from './user-title.service';
import { UserTitleRepository } from './user-title.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserTitle])],
  providers: [UserTitleService, UserTitleRepository],
  exports: [UserTitleService],
})
export class UsertitleModule {}
