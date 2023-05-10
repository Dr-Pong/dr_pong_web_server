import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import axios from 'axios';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { RoleType } from 'src/global/type/type.user.roletype';
import { SignUpRequestDto } from './dto/auth.signup.request.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService,) { }

	@Post('/42')
	async fortyTwoLogin(@Body('authCode') code: string): Promise<JwtDto> {
		console.log(code);
		const accessToken: string = await this.authService.getFTAccessToken(code);
		const userInfo: AuthDto = await this.authService.getFTUserInfo(accessToken);
		const jwt: string = await this.authService.createJwtFromUser(userInfo);
		console.log(jwt);
		return { token: jwt };
	}

	@Post('signup')
	async signUp(@Body() body: SignUpRequestDto, @Req() req) {
		const userId: number = req.user.id;
		await this.authService.signUp({
			userId,
			nickname: body.nickname,
			imageId: body.imgId,
		});
	}
}
