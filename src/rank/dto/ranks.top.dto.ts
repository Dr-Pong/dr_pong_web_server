export class RankTopDataDto {
  id: number;
  rank: number;
  nickname: string;
  ladderPoint: number;
  image: string;
}

export class RanksTopDto {
  top: RankTopDataDto[];
}
