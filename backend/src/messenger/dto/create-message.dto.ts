// messenger/dto/create-message.dto.ts
import { IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
	@IsUUID()
	userId!: string;

	@IsUUID()
	chatId!: string;

	@IsString()
	content!: string;
}
