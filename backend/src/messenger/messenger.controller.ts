// messenger/messenger.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messenger')
export class MessengerController {
	constructor(private readonly messengerService: MessengerService) { }

	@Post('message')
	createMessage(@Body() createMessageDto: CreateMessageDto) {
		return this.messengerService.createMessage(
			createMessageDto.userId,
			createMessageDto.chatId,
			createMessageDto.content,
		);
	}

	@Get('chat/:id/messages')
	getChatMessages(@Param('id') chatId: string) {
		return this.messengerService.getChatMessages(chatId);
	}
}
