import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
		const response = (await axios.post(process.env.FT_TOKEN_URI, {
			grant_type:'authorization_code',
			code:authCode,
			client_id:process.env.FT_CLIENT_ID,
			client_secret: process.env.FT_CLIENT_SECRET,
			redirect_uri:process.env.FT_REDIRECT_URI,
		},))
		console.log(response);
		if (response.status !== 200)
			throw new UnauthorizedException();
		return response.data.access_token
	}

	async getFTUserInfo(accessToken: string) : Promise<AuthDto> {
		const response = (await axios.get(process.env.FT_USER_INFO, {headers: {'Authorization':'Bearer ' + accessToken}}));
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
