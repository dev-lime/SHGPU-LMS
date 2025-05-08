// messenger/messenger.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Chat } from './entities/chat.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MessengerService {
	constructor(
		@InjectRepository(Message)
		private messageRepository: Repository<Message>,
		@InjectRepository(Chat)
		private chatRepository: Repository<Chat>,
	) { }

	async createMessage(userId: string, chatId: string, content: string): Promise<Message> {
		const message = this.messageRepository.create({
			content,
			sender: { id: userId },
			chat: { id: chatId },
		});
		return this.messageRepository.save(message);
	}

	async getChatMessages(chatId: string): Promise<Message[]> {
		return this.messageRepository.find({
			where: { chat: { id: chatId } },
			relations: ['sender'],
			order: { createdAt: 'ASC' },
		});
	}
}
