export class UserGameRoundDto {
  bounces: number;

  meWin: number;
  constructor(bounces: number, meWin: number) {
    this.bounces = bounces;
    this.meWin = meWin;
  }
}
