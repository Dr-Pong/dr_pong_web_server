import { UserGameLpDto } from './user-game.lp.dto';
import { UserGameRoundDto } from './user-game.round.dto';

export class UserGameByNicknameAndGameIdResponseDto {
  duration: number;

  me: UserGameLpDto;

  you: UserGameLpDto;

  rounds: UserGameRoundDto[] | null;
  constructor(
    duration: number,
    me: UserGameLpDto,
    you: UserGameLpDto,
    rounds: UserGameRoundDto[],
  ) {
    this.duration = duration;
    this.me = me;
    this.you = you;
    this.rounds = rounds;
  }
}
