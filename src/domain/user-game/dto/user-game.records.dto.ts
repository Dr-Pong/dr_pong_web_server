import { GameResultType } from 'src/global/type/type.game.result';
import { GamePlayerDto } from './game.player.dto';
import { GameType } from 'src/global/type/type.game';
import { UserGame } from '../user-game.entity';

export class UserGameRecordDto {
  gameId: number;
  gameType: GameType;
  playedAt: string;
  me: GamePlayerDto;
  you: GamePlayerDto;
  result: GameResultType;

  static fromUserGames(
    userId: number,
    userGames: UserGame[],
  ): UserGameRecordDto[] {
    const records: UserGameRecordDto[] = [];

    for (let i = 0; i < userGames.length / 2; i++) {
      let me: GamePlayerDto;
      let you: GamePlayerDto;
      let result: GameResultType;

      if (userGames[i * 2].user.id === userId) {
        me = GamePlayerDto.formUserGame(userGames[i * 2]);
        you = GamePlayerDto.formUserGame(userGames[i * 2 + 1]);
        result = userGames[i * 2].result;
      } else {
        me = GamePlayerDto.formUserGame(userGames[i * 2 + 1]);
        you = GamePlayerDto.formUserGame(userGames[i * 2]);
        result = userGames[i * 2 + 1].result;
      }

      records.push({
        gameId: userGames[i * 2].game.id,
        gameType: userGames[i * 2].game.type,
        playedAt: userGames[i * 2].game.startTime.toString(),
        me: me,
        you: you,
        result: result,
      });
    }
    return records;
  }
}

export class UserGameRecordsDto {
  records: UserGameRecordDto[];
  isLastPage: boolean;
}
