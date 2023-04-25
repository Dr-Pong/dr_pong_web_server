import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private jwtService: JwtService,
	) {}

	async getFTAccessToken(authCode: string) : Promise<string> {
		const response = (await axios.post('https://api.intra.42.fr/oauth/token', {
			grant_type:'authorization_code',
			code:authCode,
			client_id:'u-s4t2ud-9178ebee1b15304ba011ca8b7e3b17306c8c6b8c5e6d2bf5bfda8c6c57b5a24b',
			client_secret: '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',
			redirect_uri:'http://localhost:3000/auth/42/login',
		},))
		if (response.status !== 200)
			throw new UnauthorizedException();
		return response.data.access_token
	}

	async getFTUserInfo(accessToken: string) : Promise<AuthDto> {
		const response = (await axios.get('https://api.intra.42.fr/v2/me', {headers: {'Authorization':'Bearer ' + accessToken}}));
		if (response.status !== 200)
			throw new UnauthorizedException();
		const email = response.data.email;
		const existUser = await this.userRepository.findOne({where:{email}});

		let authdto : AuthDto;
		if (!existUser) {
			const newUser = await this.userRepository.save({
				email,
			})
			authdto = {
				id:newUser.id,
				nickname:newUser.nickname,
				roleType:newUser.roleType,
			};
		} else {
			authdto = {
				id:existUser.id,
				nickname:existUser.nickname,
				roleType:existUser.roleType,
			};
		}
		return authdto;
	}

	async createJwtFromUser(user: AuthDto) : Promise<string> {
		const token = this.jwtService.sign({
			id: user.id,
			nickname: user.nickname,
			roleType: user.roleType,
		})
		return token;
	}
}
