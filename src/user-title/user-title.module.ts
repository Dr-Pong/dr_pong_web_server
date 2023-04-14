import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTitle } from './user-title.entity';
import { UserTitleService } from './user-title.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserTitle])],
  providers: [UserTitleService],
  exports: [TypeOrmModule.forFeature([UserTitle])],
})
export class UsertitleModule {}
