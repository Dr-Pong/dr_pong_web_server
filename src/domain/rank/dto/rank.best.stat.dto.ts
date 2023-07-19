import {
  TIER_BACHELOR,
  TIER_DOCTOR,
  TIER_EGG,
  TIER_MASTER,
  TIER_STUDENT,
  TierType,
} from 'src/global/type/type.tier';

export class RankBestStatDto {
  bestLp: number | null;
  rank: number | null;
  tier: TierType;

  static eggUser(): RankBestStatDto {
    return {
      bestLp: null,
      rank: null,
      tier: TIER_EGG,
    };
  }

  static nonDoctorUser(record: number): RankBestStatDto {
    let tier;
    switch (true) {
      case record >= Number(process.env.MASTER_CUT):
        tier = TIER_MASTER;
        break;
      case record >= Number(process.env.BACHELOR_CUT):
        tier = TIER_BACHELOR;
        break;
      default:
        tier = TIER_STUDENT;
    }
    return {
      bestLp: record,
      rank: null,
      tier,
    };
  }

  static doctorUser(record: number, rank: number): RankBestStatDto {
    return {
      bestLp: record,
      rank,
      tier: TIER_DOCTOR,
    };
  }
}
