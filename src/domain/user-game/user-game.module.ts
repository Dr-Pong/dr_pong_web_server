import { Module } from '@nestjs/common';
import { UserGameService } from './user-game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGame } from './user-game.entity';
import { UserGameRepository } from './user-game.repository';
import { Season } from 'src/domain/season/season.entity';
import { SeasonRepository } from 'src/domain/season/season.repository';
import { Rank } from '../rank/rank.entity';
import { RankRepository } from '../rank/rank.repository';
import { TouchLogRepository } from '../touch-log/touch.log.repository';
import { TouchLog } from '../touch-log/touch.log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserGame, Season, Rank, TouchLog])],
  providers: [
    UserGameRepository,
    UserGameService,
    SeasonRepository,
    RankRepository,
    TouchLogRepository,
  ],
  exports: [UserGameService],
})
export class UserGameModule {}
