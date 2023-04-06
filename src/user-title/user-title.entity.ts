import { BaseTimeEntity } from 'src/base-entity/';
import { Title } from 'src/title/title.entity';
import { User } from 'src/user/user.entity';
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
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Title, { eager: true })
  @JoinColumn({ name: 'title_id' })
  title: Title;

  @Column()
  isSelected: boolean;
}
