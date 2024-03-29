import {
  GAMERESULT_LOSE,
  GAMERESULT_TIE,
  GAMERESULT_WIN,
} from 'src/global/type/type.game.result';
import { UserGame } from '../user-game.entity';

export class UserGameTotalStatDto {
  winRate: number;
  wins: number;
  ties: number;
  loses: number;

  static fromUserGames(userGames: UserGame[]): UserGameTotalStatDto {
    const wins = userGames.filter(
      (status) => status.result === GAMERESULT_WIN,
    ).length;
    const loses = userGames.filter(
      (status) => status.result === GAMERESULT_LOSE,
    ).length;
    const ties = userGames.filter(
      (status) => status.result === GAMERESULT_TIE,
    ).length;
    const winRate = wins + loses !== 0 ? (wins / (wins + loses)) * 100 : 0;

    return {
      winRate: Number(winRate.toFixed(1)),
      wins,
      ties,
      loses,
    };
  }
}
