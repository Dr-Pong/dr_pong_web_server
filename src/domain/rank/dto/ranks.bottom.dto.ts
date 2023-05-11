export class RankBottomDataDto {
  id: number;
  rank: number;
  nickname: string;
  lp: number;
}

export class RanksBottomDto {
  bottom: RankBottomDataDto[];
}
