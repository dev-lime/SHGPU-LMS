// messenger.gateway.ts
import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { MessengerService } from './messenger.service';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class MessengerGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	constructor(
		private messengerService: MessengerService,
		private authService: AuthService,
	) { }

	async handleConnection(client: Socket) {
		try {
			const user = await this.authService.getUserFromSocket(client);
			if (!user) {
				client.disconnect();
				return;
			}

			client.join(`user_${user.id}`);
			this.server.emit('userOnline', { userId: user.id });
		} catch (e) {
			client.disconnect();
		}
	}

	handleDisconnect(client: Socket) {
		// Логика обработки отключения
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('sendMessage')
	async handleMessage(
		@MessageBody() data: { chatId: string; content: string },
		@ConnectedSocket() client: Socket,
	) {
		const user = await this.authService.getUserFromSocket(client);
		const message = await this.messengerService.createMessage(
			user.id,
			data.chatId,
			data.content,
		);

		this.server.to(`chat_${data.chatId}`).emit('newMessage', message);
		return message;
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('typing')
	async handleTyping(
		@MessageBody() data: { chatId: string; isTyping: boolean },
		@ConnectedSocket() client: Socket,
	) {
		const user = await this.authService.getUserFromSocket(client);
		this.server.to(`chat_${data.chatId}`).emit('typing', {
			userId: user.id,
			isTyping: data.isTyping,
		});
	}
}
