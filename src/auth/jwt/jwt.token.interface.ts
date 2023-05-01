import { RoleType } from "src/global/type/type.user.roletype";

export class TokenInterface {
	id:number;
	nickname:string;
	roleType:RoleType;
	imp: number;
	exp: number;
}