import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { Season } from 'src/season/season.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Game extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Season, { eager: true })
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @Column()
  startTime: Date;

  @Column()
  playTime: number;

  @Column()
  type: number;
}
