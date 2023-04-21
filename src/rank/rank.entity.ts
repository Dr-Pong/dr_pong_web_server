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

  @Column()
  rank: number;

  @Column()
  record: number;

  @Column()
  bestRank: number;

  @Column()
  bestRecord: number;
}
