import { BaseTimeEntity } from 'src/global/base-entity/base-time.entity';
import { Game } from 'src/domain/game/game.entity';
import { GameResultType } from 'src/global/type/type.game.result';
import { User } from 'src/domain/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column({ name: 'result', type: 'varchar' })
  result: GameResultType;

  @Column()
  score: number;

  @Column({ name: 'lp_change', type: 'int' })
  lpChange: number;

  @Column({ name: 'lp_result', type: 'int' })
  lpResult: number;
}
