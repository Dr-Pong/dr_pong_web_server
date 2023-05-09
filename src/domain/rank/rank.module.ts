import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from 'src/domain/season/season.entity';
import { SeasonModule } from 'src/domain/season/season.module';
import { SeasonRepository } from 'src/domain/season/season.repository';
import { User } from 'src/domain/user/user.entity';
import { UserModule } from 'src/domain/user/user.module';
import { UserRepository } from 'src/domain/user/user.repository';
import { Rank } from './rank.entity';
import { RankRepository } from './rank.repository';
import { RankService } from './rank.service';
import { RankController } from './rank.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rank, Season])],
  providers: [RankService, RankRepository, SeasonRepository],
  exports: [RankService],
  controllers: [RankController],
})
export class RankModule { }
