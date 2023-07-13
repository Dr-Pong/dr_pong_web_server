export class GetUserGameExpDto {
  userId: number;
  gameId: number;

  constructor(userId: number, gameId: number) {
    this.userId = userId;
    this.gameId = gameId;
  }
}
