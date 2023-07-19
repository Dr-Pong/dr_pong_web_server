import { TierType } from 'src/global/type/type.tier';
import { RankBestStatDto } from './rank.best.stat.dto';

export class UserTotalRankResponseDto {
  bestLp: number | null;
  rank: number | null;
  tier: TierType;

  static forUserTotalRankResponse(
    userTotalRank: RankBestStatDto,
  ): UserTotalRankResponseDto {
    return {
      bestLp: userTotalRank.bestLp,
      rank: userTotalRank.rank,
      tier: userTotalRank.tier,
    };
  }
}
