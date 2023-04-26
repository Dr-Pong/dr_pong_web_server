import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { RoleType } from 'src/global/utils/enum.user.roletype';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({name:'e_mail', nullable: false})
  email: string;

  @Column({name:'nickname', default:''})
  nickname: string;

  @Column({name: 'role_type', type:'enum', enum: RoleType, nullable: false, default:RoleType.USER})
  roleType: RoleType;

  @Column({name:'image_uri', type: 'varchar',nullable:true})
  imageUrl: string;

  @Column({name:'level', default:1})
  level: number;
  
  @Column({name:'status_maessage', default:''})
  statusMessage: string;

  @Column({name:'is_second_auth_on', default:false})
  isSecondAuthOn: boolean;
}
