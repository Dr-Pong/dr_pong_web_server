import { Module } from '@nestjs/common';
import { UserGameService } from './user-game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGame } from './user-game.entity';
import { UserGameRepository } from './user-game.repository';
import { Season } from 'src/domain/season/season.entity';
import { SeasonRepository } from 'src/domain/season/season.repository';
import { Rank } from '../rank/rank.entity';
import { RankRepository } from '../rank/rank.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserGame, Season, Rank])],
  providers: [
    UserGameRepository,
    UserGameService,
    SeasonRepository,
    RankRepository,
  ],
  exports: [UserGameService],
})
export class UserGameModule {}
