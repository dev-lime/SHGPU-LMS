// common/guards/ws-jwt.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
	constructor(private authService: AuthService) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client = context.switchToWs().getClient();
		const token = client.handshake.auth.token;

		try {
			const user = await this.authService.validateToken(token);
			client.data.user = user;
			return true;
		} catch (e) {
			return false;
		}
	}
}
