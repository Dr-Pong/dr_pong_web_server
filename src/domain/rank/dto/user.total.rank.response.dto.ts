import { TierType } from 'src/global/type/type.tier';
import { RankBestStatDto } from './rank.best.stat.dto';

export class UserTotalRankResponseDto {
  record: number | null;
  rank: number | null;
  tier: TierType;

  static forUserTotalRankResponse(
    userTotalRank: RankBestStatDto,
  ): UserTotalRankResponseDto {
    return {
      record: userTotalRank.record,
      rank: userTotalRank.rank,
      tier: userTotalRank.tier,
    };
  }
}
