// messenger/entities/chat-participant.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Chat } from './chat.entity';

@Entity()
export class ChatParticipant {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@ManyToOne(() => User)
	user!: User;

	@ManyToOne(() => Chat, chat => chat.participants)
	chat!: Chat;
}
