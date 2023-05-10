import { UserGameSeasonStatDto } from './user-game.season.stat.dto';

export class UserGameSeasonStatResponseDto {
  winRate: number;
  wins: number;
  ties: number;
  loses: number;

  static forUserGameSeasonStatResponse(
    userSeasonStat: UserGameSeasonStatDto,
  ): UserGameSeasonStatResponseDto {
    return {
      winRate: userSeasonStat.winRate,
      wins: userSeasonStat.wins,
      ties: userSeasonStat.ties,
      loses: userSeasonStat.loses,
    };
  }
}
