export class GetUserGameByNicknameAndGameIdDto {
  nickname: string;

  gameId: number;
  constructor(nickname: string, gameId: number) {
    this.nickname = nickname;
    this.gameId = gameId;
  }
}
