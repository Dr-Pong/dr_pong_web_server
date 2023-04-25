import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import axios from 'axios';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService,) {}

	@Get('/42/login')
	async hi(@Query('code') code: string) : Promise<JwtDto> {
		const response = (await axios.post("http://localhost:3000/auth/42/login", {code : code}));
		return response.data;
	}

	@Post('/42/login')
	async fortyTwoLogin(@Body('code') code:string) : Promise<JwtDto> {
		const accessToken : string = await this.authService.getFTAccessToken(code);
		const userInfo : AuthDto = await this.authService.getFTUserInfo(accessToken);
		const jwt : string = await this.authService.createJwtFromUser(userInfo);
		return {token: jwt};
	}
}
