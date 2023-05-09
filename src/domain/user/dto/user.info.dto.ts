import { RoleType } from 'src/global/type/type.user.roletype';

export class UserInfoDto {
  id: number;
  nickname: string;
  roleType: RoleType;
}
