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

  @Column({ name: 'start_time', type: 'date' })
  startTime: Date;

  @Column({ name: 'play_time', type: 'int' })
  playTime: number;

  @Column({ name: 'type', type: 'varchar' })
  type: string;
}
