export class RankBottomDataDto {
  id: number;
  rank: number;
  nickname: string;
  ladderPoint: number;
}

export class RanksBottomDto {
  bottom: RankBottomDataDto[];
}
