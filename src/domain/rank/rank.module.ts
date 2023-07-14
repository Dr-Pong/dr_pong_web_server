import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from 'src/domain/season/season.entity';
import { SeasonRepository } from 'src/domain/season/season.repository';
import { Rank } from './rank.entity';
import { RankRepository } from './rank.repository';
import { RankService } from './rank.service';
import { RankController } from './rank.controller';
import { User } from '../user/user.entity';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Rank, Season, User])],
  providers: [RankService, RankRepository, SeasonRepository, UserRepository],
  exports: [RankService],
  controllers: [RankController],
})
export class RankModule {}
