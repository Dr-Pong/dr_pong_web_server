import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { InjectRepository } from "@nestjs/typeorm"
import { ExtractJwt, Strategy } from "passport-jwt"
import { User } from "src/user/user.entity"
import { Repository } from "typeorm"
import { AuthDto } from "../dto/auth.dto"
import { TokenInterface } from "./jwt.token.interface"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
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

		const userFromDb = await this.userRepository.findOne({ where: { nickname: token['nickname'] } });
		if (!userFromDb)
			throw (new UnauthorizedException());
		const existUser: AuthDto = {
			id: userFromDb.id,
			nickname: userFromDb.nickname,
			roleType: userFromDb.roleType,
		};
		return existUser;
	}

	validateUser(token: TokenInterface, user: AuthDto): void {
		if (token.id !== user.id || token.nickname !== user.nickname
			|| token.roleType !== user.roleType)
			throw (new UnauthorizedException('invalid token'));
	}
}