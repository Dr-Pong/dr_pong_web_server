import { BaseTimeEntity } from 'src/global/base-entity/base-time.entity';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class User extends BaseTimeEntity {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'nickname', default: '' })
  nickname: string;

  @ManyToOne(() => ProfileImage, { eager: true })
  @JoinColumn({ name: 'image_id' })
  image: ProfileImage;

  @Column({ name: 'level', default: 1 })
  level: number;

  @Column({ name: 'status_maessage', default: '' })
  statusMessage: string;
}
