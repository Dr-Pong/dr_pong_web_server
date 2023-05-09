import { TIER_DOCTOR, TIER_EGG, TierType } from 'src/global/type/type.tier';

export class RankBestStatDto {
  record: number | null;
  rank: number | null;
  tier: string;

  static eggUser(): RankBestStatDto {
    return {
      record: null,
      rank: null,
      tier: TIER_EGG,
    };
  }

  static nonDoctorUser(record: number, tier: TierType): RankBestStatDto {
    return {
      record,
      rank: null,
      tier,
    };
  }

  static doctorUser(record: number, rank: number): RankBestStatDto {
    return {
      record,
      rank,
      tier: TIER_DOCTOR,
    };
  }
}
