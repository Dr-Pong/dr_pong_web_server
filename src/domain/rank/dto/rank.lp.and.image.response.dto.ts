export class RankLpAndkImageResponseDto {
  lp: number;
  profileImgUrl: string;

  constructor(lp: number, imgUrl: string) {
    this.lp = lp;
    this.profileImgUrl = imgUrl;
  }
}
