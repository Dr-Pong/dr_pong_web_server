import { TierType } from 'src/global/type/type.tier';
import { RankSeasonStatDto } from './rank.season.stat.dto';

export class UserSeasonRankResponseDto {
  record: number | null;
  rank: number | null;
  tier: TierType;

  static forUserSeasonRankResponse(
    userSeasonRank: RankSeasonStatDto,
  ): UserSeasonRankResponseDto {
    return {
      record: userSeasonRank.record,
      rank: userSeasonRank.rank,
      tier: userSeasonRank.tier,
    };
  }
}
