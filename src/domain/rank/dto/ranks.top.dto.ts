export class RankTopDataDto {
  id: number;
  rank: number;
  nickname: string;
  lp: number;
  imageUrl: string;
}

export class RanksTopDto {
  top: RankTopDataDto[];
}
