import { TierType } from 'src/global/type/type.tier';
import { RankSeasonStatDto } from './rank.season.stat.dto';

export class UserSeasonRankResponseDto {
  bestLp: number | null;
  rank: number | null;
  tier: TierType;

  static forUserSeasonRankResponse(
    userSeasonRank: RankSeasonStatDto,
  ): UserSeasonRankResponseDto {
    return {
      bestLp: userSeasonRank.bestLp,
      rank: userSeasonRank.rank,
      tier: userSeasonRank.tier,
    };
  }
}
