import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { Game } from 'src/game/game.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameResultType } from './enum.user-game.result';

@Entity()
export class UserGame extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Game, { eager: true })
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'result', type: 'enum', enum: GameResultType })
  result: GameResultType;

  @Column()
  score: number;

  @Column()
  lpChange: number;

  @Column()
  lpResult: number;
}
