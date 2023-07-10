import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameEvent } from 'src/global/type/type.game.event';
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

  @Column({ name: 'ball_direction_x', type: 'float' })
  ballDirectionX: number;

  @Column({ name: 'ball_direction_y', type: 'float' })
  ballDirectionY: number;

  @Column({ name: 'ball_position_x', type: 'float' })
  ballPositionX: number;

  @Column({ name: 'ball_position_y', type: 'float' })
  ballPositionY: number;

  @Column({ name: 'ball_spin_speed', type: 'float' })
  ballSpinSpeed: number;
}
