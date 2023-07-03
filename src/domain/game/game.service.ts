import { Injectable } from '@nestjs/common';
import { Game } from 'src/domain/game/game.entity';
import { GameRepository } from './game.repository';
import { UserGameRepository } from '../user-game/user-game.repository';
import { PostGameDto } from './dto/post.game.dto';
import { TouchLogRepository } from '../touch-log/touch.log.repository';
import { SeasonRepository } from '../season/season.repository';
import { Season } from '../season/season.entity';
import { UserGame } from '../user-game/user-game.entity';

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

    const userGame1: UserGame = await this.userGameRepository.save(
      player1,
      game,
    );
    const userGame2: UserGame = await this.userGameRepository.save(
      player2,
      game,
    );

    const logs = postGameDto.logs;
    for (const log of logs) {
      const user = player1.id === log.userId ? userGame1.user : userGame2.user;
      await this.touchLogRepository.save(user, log.event, log.round, log.ball);
    }
  }
}
