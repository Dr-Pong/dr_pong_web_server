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

  @Column({ name: 'ball_speed' })
  ballSpeed: number;

  @Column({ name: 'ball_direction_x' })
  ballDirectionX: number;

  @Column({ name: 'ball_direction_y' })
  ballDirectionY: number;

  @Column({ name: 'ball_position_x' })
  ballPositionX: number;

  @Column({ name: 'ball_position_y' })
  ballPositionY: number;

  @Column({ name: 'ball_spin_speed' })
  ballSpinSpeed: number;
}
