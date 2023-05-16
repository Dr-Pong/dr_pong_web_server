export class UserGameLpDto {
  lp: number;

  lpChange: number;
  constructor(lp: number, lpChange: number) {
    this.lp = lp;
    this.lpChange = lpChange;
  }
}
