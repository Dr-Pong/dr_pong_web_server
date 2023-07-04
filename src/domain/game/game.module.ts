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

@Module({
  imports: [TypeOrmModule.forFeature([Game, Season, UserGame, TouchLog])],
  providers: [
    GameService,
    GameRepository,
    UserGameRepository,
    SeasonRepository,
    TouchLogRepository,
  ],
  exports: [GameService],
  controllers: [GameController],
})
export class GameModule {}
