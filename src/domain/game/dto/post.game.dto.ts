import { GameType } from 'src/global/type/type.game';
import { GameMode } from 'src/global/type/type.game.mode';

export class PostGameDto {
  player1: {
    id: number;
    score: number;
    lpChange: number;
  };
  player2: {
    id: number;
    score: number;
    lpChange: number;
  };
  mode: GameMode;
  type: GameType;
  startTime: Date;
  endTime: Date;
  logs: {
    userId: number;
    event: 'touch' | 'score';
    round: number;
    ball: {
      speed: number;
      direction: { x: number; y: number };
      position: { x: number; y: number };
      spinSpeed: number;
    };
  }[];
}
