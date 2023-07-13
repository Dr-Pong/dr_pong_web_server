export class GetUserGameExpResponseDto {
  beforeExp: number;
  expChange: number;
  levelExp: number;

  constructor(beforeExp: number, expChange: number, levelExp: number) {
    this.beforeExp = beforeExp;
    this.expChange = expChange;
    this.levelExp = levelExp;
  }
}
