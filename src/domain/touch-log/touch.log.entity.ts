import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { GameEvent } from 'src/global/type/type.game.event';
import { Ball } from './object/ball';

@Entity()
export class TouchLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  event: GameEvent;

  @Column()
  round: number;

  @Column()
  Ball: Ball;
}
