import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTitle } from './user-title.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserTitle])],
  providers: [],
  exports: [],
})
export class UsertitleModule {}
