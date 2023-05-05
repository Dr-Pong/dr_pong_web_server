export class RankTopDataDto {
  id: number;
  rank: number;
  nickname: string;
  ladderPoint: number;
  imageUrl: string;
}

export class RanksTopDto {
  top: RankTopDataDto[];
}
