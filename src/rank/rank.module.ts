import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from 'src/season/season.entity';
import { SeasonModule } from 'src/season/season.module';
import { SeasonRepository } from 'src/season/season.repository';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserRepository } from 'src/user/user.repository';
import { Rank } from './rank.entity';
import { RankRepository } from './rank.repository';
import { RankService } from './rank.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rank, Season])],
  providers: [RankService, RankRepository, SeasonRepository],
  exports: [RankService],
})
export class RankModule {}
