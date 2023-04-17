import { Achievemet } from 'src/achievemet/achievement.entity';
import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserAchievement extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Achievemet, { eager: true })
  @JoinColumn({ name: 'achive_id' })
  achievement: Achievemet;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  isSelected: boolean;
}
