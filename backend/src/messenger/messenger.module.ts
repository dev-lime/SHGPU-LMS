// messenger.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessengerService } from './messenger.service';
import { MessengerController } from './messenger.controller';
import { Message } from './entities/message.entity';
import { Chat } from './entities/chat.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { UsersModule } from '../users/users.module';
import { MessengerGateway } from './messenger.gateway';

@Module({
	imports: [
		TypeOrmModule.forFeature([Message, Chat, ChatParticipant]),
		UsersModule,
	],
	controllers: [MessengerController],
	providers: [MessengerService, MessengerGateway],
})
export class MessengerModule { }
