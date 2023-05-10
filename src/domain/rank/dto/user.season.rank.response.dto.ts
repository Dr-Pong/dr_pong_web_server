import { TierType } from 'src/global/type/type.tier';
import { RankBestStatDto } from './rank.best.stat.dto';

export class UserSeasonRankResponseDto {
  record: number | null;
  rank: number | null;
  tier: TierType;

  static forUserSeasonRankResponse(
    userSeasonRank: RankBestStatDto,
  ): UserSeasonRankResponseDto {
    return {
      record: userSeasonRank.record,
      rank: userSeasonRank.rank,
      tier: userSeasonRank.tier,
    };
  }
}
