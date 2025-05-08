// messenger/messenger.gateway.ts
import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { MessengerService } from './messenger.service';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class MessengerGateway {
	@WebSocketServer()
	server: Server = new Server();

	constructor(
		private messengerService: MessengerService,
	) { }

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('sendMessage')
	async handleMessage(
		@MessageBody() data: { chatId: string; content: string },
		@ConnectedSocket() client: Socket,
	) {
		const user = client.data.user;
		const message = await this.messengerService.createMessage(
			user.id,
			data.chatId,
			data.content,
		);

		this.server.to(`chat_${data.chatId}`).emit('newMessage', message);
		return message;
	}
}
