import { RoleType } from "../../global/utils/enum.user.roletype";

export class AuthDto {
	id:number;
	nickname:string;
	roleType:RoleType;
}