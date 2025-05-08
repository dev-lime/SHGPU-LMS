// auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@UseGuards(LocalAuthGuard)
	@Post('login')
	async login(@Body() loginDto: LoginDto, @Req() req: { user: User }) {
		return this.authService.login(req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Post('logout')
	async logout(@Req() req: { user: User }) {
		return { message: 'Logged out successfully' };
	}

	@UseGuards(RefreshJwtGuard)
	@Post('refresh')
	async refresh(@Req() req: { user: User }) {
		return this.authService.refreshToken(req.user);
	}
}
