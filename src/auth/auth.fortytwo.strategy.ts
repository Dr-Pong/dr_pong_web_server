import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile } from "passport";
import { Strategy, VerifyCallback } from "passport-oauth2";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	constructor() {
		super({
			authorizationURL: '',
			tokenURL: 'https://api.intra.42.fr/oauth/token',
			clientID: 'id',	//api id
			clientSecret: '',	//api secert key
			callbackURL: 'CALLBACKURL',
			passReqToCallback: true,
		})
	}

	async validate(
		request: { session: { accessToken: string } },
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		cb: VerifyCallback,
	  ): Promise<any> {
		console.log('accessToken:', accessToken);
		console.log('refreshToken:', refreshToken);
		console.log(profile);

		return cb(null, profile);
	  }
}