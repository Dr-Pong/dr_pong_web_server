import { TierType } from 'src/global/type/type.tier';

export class UserTotalRankResponseDto {
  record: number | null;
  rank: number | null;
  tier: TierType;
}
