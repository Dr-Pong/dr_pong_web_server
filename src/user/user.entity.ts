import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { RoleType } from 'src/global/utils/enum.user.roletype';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({name:'e_mail', nullable: false})
  email: string;

  @Column({name:'nickname', nullable:false, default:''})
  nickname: string;

  @Column({type:'enum', enum: RoleType, nullable: false, default:RoleType.USER})
  roleType: RoleType;

  @Column({name:'image_uri', nullable:true})
  imageUrl: string;

  @Column({name:'level', nullable:false, default:1})
  level: number;
  
  @Column({name:'status_maessage', nullable:false, default:''})
  statusMessage: string;

  @Column({name:'is_second_auth_on', nullable:false, default:false})
  isSecondAuthOn: boolean;
}
