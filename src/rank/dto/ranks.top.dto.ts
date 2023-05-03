export class RankTopDataDto {
  id: number;
  rank: number;
  nickname: string;
  ladderPoint: number;
}

export class RanksTopDto {
  top: RankTopDataDto[];
}
