export class RankTopDataDto {
  id: number;
  rank: number;
  nickname: string;
  lp: number;
  imgUrl: string;
}

export class RanksTopDto {
  top: RankTopDataDto[];
}
