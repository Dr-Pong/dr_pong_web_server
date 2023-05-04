import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { RoleType } from 'src/global/type/type.user.roletype';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ name: 'image_uri', type: 'number', nullable: true })
  imageId: number;

  @Column({ name: 'level', default: 1 })
  level: number;

  @Column({ name: 'status_maessage', default: '' })
  statusMessage: string;

  @Column({ name: 'is_second_auth_on', default: false })
  isSecondAuthOn: boolean;
}
