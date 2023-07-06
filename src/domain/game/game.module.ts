import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { GameRepository } from './game.repository';
import { UserGameRepository } from '../user-game/user-game.repository';
import { Season } from '../season/season.entity';
import { SeasonRepository } from '../season/season.repository';
import { TouchLogRepository } from '../touch-log/touch.log.repository';
import { UserGame } from '../user-game/user-game.entity';
import { TouchLog } from '../touch-log/touch.log.entity';
import { UserAchievementRepository } from '../user-achievement/user-achievement.repository';
import { AchievementRepository } from '../achievement/achievement.repository';
import { UserTitleRepository } from '../user-title/user-title.repository';
import { UserRepository } from '../user/user.repository';
import { UserAchievement } from '../user-achievement/user-achievement.entity';
import { Achievement } from '../achievement/achievement.entity';
import { UserTitle } from '../user-title/user-title.entity';
import { User } from '../user/user.entity';
import { Rank } from '../rank/rank.entity';
import { RankRepository } from '../rank/rank.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Game,
      Season,
      UserGame,
      TouchLog,
      UserAchievement,
      Achievement,
      UserTitle,
      User,
      Rank,
    ]),
  ],
  providers: [
    GameService,
    GameRepository,
    UserGameRepository,
    SeasonRepository,
    TouchLogRepository,
    UserAchievementRepository,
    AchievementRepository,
    UserTitleRepository,
    UserRepository,
    RankRepository,
  ],
  exports: [GameService],
  controllers: [GameController],
})
export class GameModule {}
