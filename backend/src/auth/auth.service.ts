// auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private configService: ConfigService,
	) { }

	async validateUser(email: string, pass: string): Promise<User | null> {
		const user = await this.usersService.findOneByEmail(email);
		if (user && (await bcrypt.compare(pass, user.password))) {
			return user;
		}
		return null;
	}

	async login(user: User) {
		const payload = {
			email: user.email,
			sub: user.id,
			role: user.role,
		};

		return {
			access_token: this.jwtService.sign(payload),
			refresh_token: this.jwtService.sign(payload, {
				secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
				expiresIn: '7d',
			}),
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				profile: user.profile,
			},
		};
	}

	async refreshToken(user: User) {
		const payload = {
			email: user.email,
			sub: user.id,
			role: user.role,
		};

		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async validateToken(token: string): Promise<User | null> {
		try {
			const decoded = this.jwtService.verify(token);
			// Здесь будет логика проверки пользователя по id или другому параметру
			return await this.usersService.findOneById(decoded.sub);
		} catch (e) {
			return null;
		}
	}
}
