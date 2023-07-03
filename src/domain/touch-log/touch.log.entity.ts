import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameEvent } from 'src/global/type/type.game.event';
import { Ball } from './object/ball';
import { UserGame } from '../user-game/user-game.entity';

@Entity()
export class TouchLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserGame, { eager: true })
  @JoinColumn({ name: 'user_game' })
  userGame: UserGame;

  @Column({ name: 'event', type: 'varchar' })
  event: GameEvent;

  @Column({ name: 'round', type: 'int' })
  round: number;

  @Column({ name: 'ball' })
  ball: Ball;
}
