import { RoleType } from "src/global/type/type.user.roletype";

export class UserMeDto {
	nickname: string;
	imgUrl: string;
	isSecondAuthOn: boolean;
	roleType: RoleType;
}