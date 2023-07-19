import { TierType } from 'src/global/type/type.tier';

export class RankSeasonStatDto {
  bestLp: number | null;
  rank: number | null;
  tier: TierType;
}
