import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from 'src/season/season.entity';
import { User } from 'src/user/user.entity';
import { Rank } from './rank.entity';
import { RankService } from './rank.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Season, Rank])],
  providers: [RankService],
  exports: [TypeOrmModule.forFeature([User, Season, Rank])],
})
export class RankModule {}
