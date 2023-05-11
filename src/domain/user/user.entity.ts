import { BaseTimeEntity } from 'src/global/base-entity/base-time.entity';
import { RoleType } from 'src/global/type/type.user.roletype';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'e_mail', nullable: false })
  email: string;

  @Column({ name: 'nickname', default: '' })
  nickname: string;

  @Column({
    name: 'role_type',
    type: 'varchar',
    nullable: false,
    default: 'member',
  })
  roleType: RoleType;

  @ManyToOne(() => ProfileImage, { eager: true })
  @JoinColumn({ name: 'image_id' })
  image: ProfileImage;

  @Column({ name: 'level', default: 1 })
  level: number;

  @Column({ name: 'status_maessage', default: '' })
  statusMessage: string;

  @Column({ name: 'second_auth_secret', default: null })
  secondAuthSecret: string;
}
