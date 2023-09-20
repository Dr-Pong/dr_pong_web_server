import { Module } from '@nestjs/common';
import { SeasonService } from './season.service';
import { SeasonRepository } from './season.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './season.entity';
import { User } from '../user/user.entity';
import { UserRepository } from '../user/user.repository';
import { Rank } from '../rank/rank.entity';
import { RankRepository } from '../rank/rank.repository';
import { SeasonController } from './season.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Season, User, Rank])],
  providers: [SeasonRepository, SeasonService, UserRepository, RankRepository],
  exports: [],
  controllers: [SeasonController],
})
export class SeasonModule {}
