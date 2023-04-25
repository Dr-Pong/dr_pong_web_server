import { RoleType } from "src/global/utils/enum.user.roletype";

export class TokenInterface {
	id:number;
	nickname:string;
	roleType:RoleType;
	imp: number;
	exp: number;
}