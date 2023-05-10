import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { InjectRepository } from "@nestjs/typeorm"
import { ExtractJwt, Strategy } from "passport-jwt"
import { User } from "src/domain/user/user.entity"
import { Repository } from "typeorm"
import { AuthDto } from "../dto/auth.dto"
import { TokenInterface } from "./jwt.token.interface"
import { UserRepository } from "../user.repository"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(User)
		private userRepository: UserRepository,
	) {
		super({
			secretOrKey: 'jwtSecret',
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		})
	};
	users: Map<string, AuthDto> = new Map();

	async validate(payload): Promise<AuthDto> {
		const user = await this.findUser(payload);
		this.validateUser(payload, user);
		return user;
	}

	async findUser(token: TokenInterface): Promise<AuthDto> {
		const userFromMemory = this.users.get(token.nickname);

		if (userFromMemory)
			return userFromMemory;

		const userFromDb = await this.userRepository.findByNickname(token['nickname']);
		if (!userFromDb)
			throw (new UnauthorizedException());
		const existUser: AuthDto = {
			id: userFromDb.id,
			nickname: userFromDb.nickname,
			roleType: userFromDb.roleType,
			secondAuthRequired: token.secondAuthRequierd,
		};
		return existUser;
	}

	/** 닉네임 설정이 안되어 있거나 2차 인증이 필요하면 에러 반환 */
	validateUser(token: TokenInterface, user: AuthDto): void {
		if (token.nickname === null || token.secondAuthRequierd === true)
			throw (new UnauthorizedException());
	}
}