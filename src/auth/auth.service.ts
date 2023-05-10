import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { User } from 'src/domain/user/user.entity';
import { AuthDto } from './dto/auth.dto';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { SignUpDto } from './dto/auth.signup.dto';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { UserRepository } from './user.repository';
import { ProfileImageRepository } from './profile-image.repository';

@Injectable()
export class AuthService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly imageRepository: ProfileImageRepository,
		private jwtService: JwtService,
	) { }
	optSecret: Map<number, string> = new Map();

	async generateOtp(userId: number) {
		const secretKey = authenticator.generateSecret();
		const url = authenticator.keyuri(String(userId), 'Dr.Pong', secretKey);
		const qrCode = await toDataURL(url);
		this.optSecret.set(userId, secretKey);

		return {
			secretKey,
			url,
			qrCode,
		}
	}

	verifyOtp(userId: number, token: string): boolean {
		const secret = this.optSecret.get(userId);
		const isValid: boolean = authenticator.verify({ token, secret });
		if (isValid)
			this.optSecret.delete(userId);
		return isValid;
	}

	@Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
	async signUp(signUpDto: SignUpDto) {
		const { user, profileImage } = await this.validateSignUp(signUpDto);
		await this.userRepository.signUp({ user, profileImage, nickname: signUpDto.nickname });
	}

	async getFTAccessToken(authCode: string): Promise<string> {
		console.log(process.env.FT_TOKEN_URI)
		try {
			const response = (await axios.post(process.env.FT_TOKEN_URI, {
				grant_type: 'authorization_code',
				code: authCode,
				client_id: process.env.FT_CLIENT_ID,
				client_secret: process.env.FT_CLIENT_SECRET,
				redirect_uri: process.env.FT_REDIRECT_URI,
			},))
			return response.data.access_token;
		} catch (error) {
			console.log(error);
			throw new UnauthorizedException();
		}
	}

	async getFTUserInfo(accessToken: string): Promise<AuthDto> {
		const response = (await axios.get(process.env.FT_USER_INFO, { headers: { 'Authorization': 'Bearer ' + accessToken } }));
		if (response.status !== 200)
			throw new UnauthorizedException();
		const email = response.data.email;
		const existUser: User = await this.userRepository.findByEmail(email);

		let authdto: AuthDto;
		if (!existUser) {
			const newUser = await this.userRepository.createUser(email)
			authdto = {
				id: newUser.id,
				nickname: null,
				roleType: newUser.roleType,
				secondAuthRequired: false,
			};
		} else {
			authdto = {
				id: existUser.id,
				nickname: existUser.nickname,
				roleType: existUser.roleType,
				secondAuthRequired: existUser.isSecondAuthOn,
			};
		}
		return authdto;
	}

	async createJwtFromUser(user: AuthDto): Promise<string> {
		const token = this.jwtService.sign({
			id: user.id,
			nickname: user.nickname,
			roleType: user.roleType,
			secondAuthRequired: user.secondAuthRequired,
		})
		return token;
	}

	async validateSignUp(signUpDto: SignUpDto): Promise<{ user: User, profileImage: ProfileImage }> {
		const user = await this.userRepository.findById(signUpDto.userId);
		if (!user) {
			throw new UnauthorizedException();
		}
		if (user.nickname !== null) {
			throw new BadRequestException();
		}
		if (await this.userRepository.findByNickname(signUpDto.nickname)) {
			throw new ConflictException();
		}
		const profileImage: ProfileImage = await this.imageRepository.findById(signUpDto.imageId);
		if (!profileImage) {
			throw new BadRequestException();
		}
		return { user, profileImage };
	}
}
