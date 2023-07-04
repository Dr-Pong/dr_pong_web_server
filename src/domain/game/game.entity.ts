import { BaseTimeEntity } from 'src/global/base-entity/base-time.entity';
import { GameType } from 'src/global/type/type.game';
import { Season } from 'src/domain/season/season.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameMode } from 'src/global/type/type.game.mode';

@Entity()
export class Game extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Season, { eager: true })
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'play_time', type: 'int' })
  playTime: number;

  @Column({ name: 'type', type: 'varchar' })
  type: GameType;

  @Column({ name: 'mode', type: 'varchar' })
  mode: GameMode;
}
