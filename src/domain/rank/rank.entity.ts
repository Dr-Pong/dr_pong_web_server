import { BaseTimeEntity } from 'src/global/base-entity/base-time.entity';
import { Season } from 'src/domain/season/season.entity';
import { User } from 'src/domain/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'rank' })
export class Rank extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Season, { eager: true })
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'ladder_point' })
  ladderPoint: number;

  @Column({ name: 'highest_point' })
  highestPoint: number;
}
