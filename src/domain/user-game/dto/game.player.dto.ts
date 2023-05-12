import { UserGame } from '../user-game.entity';

export class GamePlayerDto {
  imgUrl: string;
  nickname: string;
  score: number;

  static formUserGame(userGame: UserGame): GamePlayerDto {
    return {
      imgUrl: userGame.user.image.url,
      nickname: userGame.user.nickname,
      score: userGame.score,
    };
  }
}
