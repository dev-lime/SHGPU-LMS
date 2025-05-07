// entities/message.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Message {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	content: string;

	@ManyToOne(() => User)
	sender: User;

	@ManyToOne(() => Chat, chat => chat.messages)
	chat: Chat;

	@Column({ default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ default: false })
	isRead: boolean;
}
