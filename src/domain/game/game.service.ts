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

    const game: Game = await this.gameRepository.save(
      postGameDto,
      currentSeason,
    );
    const player1Result = this.checkGameResult(
      postGameDto.player1.score,
      postGameDto.player2.score,
    );
    const player2Result = this.checkGameResult(
      postGameDto.player2.score,
      postGameDto.player1.score,
    );

    const userGame1: UserGame = await this.userGameRepository.save(
      player1,
      game,
      player1Result,
    );
    const userGame2: UserGame = await this.userGameRepository.save(
      player2,
      game,
      player2Result,
    );

    const logs = postGameDto.logs;
    for (const log of logs) {
      const userGame: UserGame =
        player1.id === log.userId ? userGame1 : userGame2;
      await this.touchLogRepository.save(
        userGame,
        log.event,
        log.round,
        log.ball,
      );
    }
  }

  checkGameResult(player1Score: number, player2Score: number): GameResultType {
    if (player1Score > player2Score) {
      return GAMERESULT_WIN;
    } else if (player1Score < player2Score) {
      return GAMERESULT_LOSE;
    } else {
      return GAMERESULT_TIE;
    }
  }
}
