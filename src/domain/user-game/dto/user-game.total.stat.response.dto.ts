import { UserGameTotalStatDto } from './user-game.total.stat.dto';

export class UserGameTotalStatResponseDto {
  winRate: number;
  wins: number;
  ties: number;
  loses: number;

  static forUserGameTotalStatResponse(
    userTotalStat: UserGameTotalStatDto,
  ): UserGameTotalStatResponseDto {
    return {
      winRate: userTotalStat.winRate,
      wins: userTotalStat.wins,
      ties: userTotalStat.ties,
      loses: userTotalStat.loses,
    };
  }
}
