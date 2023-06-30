import { Injectable } from '@nestjs/common';
import { Game } from 'src/domain/game/game.entity';
import { GameRepository } from './game.repository';
import { UserGameRepository } from '../user-game/user-game.repository';
import { PostGameDto } from './dto/post.game.dto';
import { UserGame } from '../user-game/user-game.entity';
import { TouchLog } from '../touch-log/touch.log.entity';
import { TouchLogRepository } from '../touch-log/touch.log.repository';
import { SeasonRepository } from '../season/season.repository';
import { Season } from '../season/season.entity';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly userGameRepository: UserGameRepository,
    private readonly userRepository: UserRepository,
    private readonly touchLogRepository: TouchLogRepository,
    private readonly seasonRepository: SeasonRepository,
  ) {}

  async postGame(postGameDto: PostGameDto): Promise<void> {
    const currentSeason: Season =
      await this.seasonRepository.findCurrentSeason();

    const game: Game = await this.gameRepository.save(
      postGameDto,
      currentSeason,
    );

    const player1 = postGameDto.player1;
    const userGame1 = new UserGame();
    userGame1.game = game;
    userGame1.user = await this.userRepository.findById(player1.id);
    userGame1.score = player1.score;
    userGame1.lpChange = player1.lpChange;
    await this.userGameRepository.save(userGame1);

    const player2 = postGameDto.player2;
    const userGame2 = new UserGame();
    userGame2.game = game;
    userGame2.user = await this.userRepository.findById(player2.id);
    userGame2.score = player2.score;
    userGame2.lpChange = player2.lpChange;
    await this.userGameRepository.save(userGame2);

    const logs = postGameDto.logs;
    for (const log of logs) {
      const touchLog = new TouchLog();
      touchLog.user = await this.userRepository.findById(log.userId);
      touchLog.event = log.event;
      touchLog.round = log.round;
      touchLog.Ball = log.ball;
      await this.touchLogRepository.save(touchLog);
    }
  }
}
