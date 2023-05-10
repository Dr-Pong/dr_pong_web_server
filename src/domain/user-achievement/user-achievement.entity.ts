import { Achievement } from 'src/domain/achievement/achievement.entity';
import { BaseTimeEntity } from 'src/global/base-entity/base-time.entity';
import { User } from 'src/domain/user/user.entity';
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

  @Column({
    nullable: true,
    name: 'selected_order',
    type: 'int',
    default: null,
  })
  selectedOrder: number;

  @ManyToOne(() => Achievement, { eager: true })
  @JoinColumn({ name: 'achive_id' })
  achievement: Achievement;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
