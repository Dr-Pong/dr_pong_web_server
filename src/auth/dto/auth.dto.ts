import { RoleType } from "../../global/type/type.user.roletype";

export class AuthDto {
	id:number;
	nickname:string;
	roleType:RoleType;
}