// auth/strategies/refresh-token.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor(private configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret-key',
			passReqToCallback: true,
		});
	}

	async validate(req: Request, payload: any) {
		const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();
		return { ...payload, refreshToken };
	}
}
