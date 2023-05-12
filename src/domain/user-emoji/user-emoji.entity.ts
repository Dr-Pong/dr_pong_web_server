import { BaseTimeEntity } from 'src/global/base-entity/base-time.entity';
import { Emoji } from 'src/domain/emoji/emoji.entity';
import { User } from 'src/domain/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserEmoji extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
    name: 'selected_order',
    type: 'int',
    default: null,
  })
  selectedOrder: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Emoji, { eager: true })
  @JoinColumn({ name: 'emoji_id' })
  emoji: Emoji;
}
