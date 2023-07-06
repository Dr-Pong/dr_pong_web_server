import { Injectable } from '@nestjs/common';
import { Game } from 'src/domain/game/game.entity';
import { GameRepository } from './game.repository';
import { UserGameRepository } from '../user-game/user-game.repository';
import { PostGameDto } from './dto/post.game.dto';
import { TouchLogRepository } from '../touch-log/touch.log.repository';
import { SeasonRepository } from '../season/season.repository';
import { Season } from '../season/season.entity';
import { UserGame } from '../user-game/user-game.entity';
import {
  GAMERESULT_LOSE,
  GAMERESULT_TIE,
  GAMERESULT_WIN,
  GameResultType,
} from 'src/global/type/type.game.result';
import { UserAchievementRepository } from '../user-achievement/user-achievement.repository';
import { UserTitleRepository } from '../user-title/user-title.repository';
import { UserRepository } from '../user/user.repository';
import {
  TIER_BACHELOR,
  TIER_DOCTOR,
  TIER_MASTER,
  TierType,
} from 'src/global/type/type.tier';
import { Ball } from '../touch-log/object/ball';
import { TouchLog } from '../touch-log/touch.log.entity';
import { GameEvent } from 'src/global/type/type.game.event';

@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly userGameRepository: UserGameRepository,
    private readonly touchLogRepository: TouchLogRepository,
    private readonly seasonRepository: SeasonRepository,
  ) {}

  async postGame(postGameDto: PostGameDto): Promise<void> {
    const { player1, player2 } = postGameDto;
    const currentSeason: Season =
      await this.seasonRepository.findCurrentSeason();

    const game: Game = await this.saveGame(postGameDto, currentSeason);

    const player1Result: GameResultType = this.checkGameResult(
      player1.score,
      player2.score,
    );
    const player2Result: GameResultType = this.checkGameResult(
      player2.score,
      player1.score,
    );

    const userGame1: UserGame = await this.saveUserGames(
      game,
      currentSeason.id,
      player1,
      player1Result,
    );
    const userGame2: UserGame = await this.saveUserGames(
      game,
      currentSeason.id,
      player2,
      player2Result,
    );

    const logs = postGameDto.logs;
    for (const log of logs) {
      const userGame: UserGame =
        player1.id === log.userId ? userGame1 : userGame2;
      await this.saveTouchLog(userGame, log.event, log.round, log.ball);
    }
  }

  async saveGame(
    postGameDto: PostGameDto,
    currentSeason: Season,
  ): Promise<Game> {
    return this.gameRepository.save(postGameDto, currentSeason);
  }

  async saveUserGames(
    game: Game,
    currentSeasonId: number,
    player: any,
    result: GameResultType,
  ): Promise<UserGame> {
    return this.userGameRepository.save(player, game, result, currentSeasonId);
  }

  async saveTouchLog(
    userGame: UserGame,
    event: GameEvent,
    round: number,
    ball: Ball,
  ): Promise<TouchLog> {
    return this.touchLogRepository.save(userGame, event, round, ball);
  }

  private checkGameResult(
    player1Score: number,
    player2Score: number,
  ): GameResultType {
    if (player1Score > player2Score) {
      return GAMERESULT_WIN;
    } else if (player1Score < player2Score) {
      return GAMERESULT_LOSE;
    } else {
      return GAMERESULT_TIE;
    }
  }

  async checkTier(playerLP: number): Promise<TierType> {
    if (playerLP >= Number(process.env.DOCTOR_CUT)) {
      return TIER_DOCTOR;
    } else if (playerLP >= Number(process.env.MASTER_CUT)) {
      return TIER_MASTER;
    } else if (playerLP >= Number(process.env.BACHELOR_CUT)) {
      return TIER_BACHELOR;
    } else {
      return null;
    }
  }
}
