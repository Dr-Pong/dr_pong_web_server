import { RoleType } from 'src/global/utils/enum.user.roletype';

export class UserInfoDto {
  id: number;
  nickname: string;
  roleType: RoleType;
}
