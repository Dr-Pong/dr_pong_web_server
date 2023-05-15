import { TierType } from 'src/global/type/type.tier';

export class RankSeasonStatDto {
  record: number | null;
  rank: number | null;
  tier: TierType;
}
