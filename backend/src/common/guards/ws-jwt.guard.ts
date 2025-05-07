import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
	constructor(private authService: AuthService) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client = context.switchToWs().getClient();
		const token = client.handshake.auth.token || client.handshake.query.token;

		try {
			client.user = await this.authService.verifyToken(token);
			return true;
		} catch (e) {
			return false;
		}
	}
}
