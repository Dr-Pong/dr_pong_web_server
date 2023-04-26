import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { Emoji } from 'src/emoji/emoji.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserEmoji extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable:true, name: 'selected_order', type: 'bigint', default: null})
  selectedOrder: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Emoji, { eager: true })
  @JoinColumn({ name: 'emoji_id' })
  emoji: Emoji;
}
