import {
  GAMERESULT_LOSE,
  GAMERESULT_TIE,
  GAMERESULT_WIN,
} from 'src/global/type/type.game.result';
import { UserGame } from '../user-game.entity';

export class UserGameSeasonStatDto {
  winRate: number;
  wins: number;
  ties: number;
  loses: number;

  static fromUserGames(userGames: UserGame[]): UserGameSeasonStatDto {
    const wins = userGames.filter(
      (status) => status.result === GAMERESULT_WIN,
    ).length;
    const loses = userGames.filter(
      (status) => status.result === GAMERESULT_LOSE,
    ).length;
    const ties = userGames.filter(
      (status) => status.result === GAMERESULT_TIE,
    ).length;

    return {
      winRate: wins + loses !== 0 ? (wins / (wins + loses)) * 100 : 0,
      wins,
      ties,
      loses,
    };
  }
}
