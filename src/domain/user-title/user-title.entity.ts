import { BaseTimeEntity } from 'src/global/base-entity/base-time.entity';
import { Title } from 'src/domain/title/title.entity';
import { User } from 'src/domain/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserTitle extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Title, { eager: true })
  @JoinColumn({ name: 'title_id' })
  title: Title;

  @Column({ name: 'is_selected', type: 'boolean', default: false })
  isSelected: boolean;
}
