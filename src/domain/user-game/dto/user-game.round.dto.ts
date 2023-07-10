export class UserGameRoundDto {
  bounces: number;

  meWin: boolean;
  constructor(bounces: number, meWin: boolean) {
    this.bounces = bounces;
    this.meWin = meWin;
  }
}
