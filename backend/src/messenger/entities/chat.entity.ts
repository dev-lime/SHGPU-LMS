// messenger/entities/chat.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Message } from './message.entity';
import { ChatParticipant } from './chat-participant.entity';

@Entity()
export class Chat {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	name!: string;

	@Column({ default: false })
	isGroup!: boolean;

	@OneToMany(() => Message, message => message.chat)
	messages!: Message[];

	@OneToMany(() => ChatParticipant, participant => participant.chat)
	participants!: ChatParticipant[];
}
