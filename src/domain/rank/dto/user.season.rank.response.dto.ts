import { TierType } from 'src/global/type/type.tier';

export class UserSeasonRankResponseDto {
  record: number | null;
  rank: number | null;
  tier: TierType;
}
