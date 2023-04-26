import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { Season } from 'src/season/season.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Rank extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Season, { eager: true })
  @JoinColumn({ name: 'season' })
  season: Season;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({name: 'ladder_rank', type: 'int'})
  ladderRank: number;

  @Column({name: 'ladder_point', type: 'int'})
  ladderPoint: number;

  @Column({name: 'highest_ranking', type: 'int'})
  highestRanking: number;

  @Column({name: 'highest_point', type: 'int'})
  highestPoint: number;
}
