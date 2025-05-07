// documents.service.ts
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Template } from './entities/template.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { compile } from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
	constructor(
		@InjectRepository(Template)
		private templateRepository: Repository<Template>,
	) { }

	async generateDocument(user: User, templateId: string): Promise<Buffer> {
		const template = await this.templateRepository.findOne({
			where: { id: templateId },
		});

		if (!template) {
			throw new Error('Template not found');
		}

		// Загружаем шаблон из файла
		const templatePath = path.join(
			process.cwd(),
			'templates',
			`${template.templateFile}.hbs`,
		);
		const templateContent = fs.readFileSync(templatePath, 'utf-8');

		// Компилируем шаблон с данными пользователя
		const compiledTemplate = compile(templateContent);
		const data = this.prepareUserData(user);
		const result = compiledTemplate(data);

		// В перспективе: конвертация в PDF
		return Buffer.from(result, 'utf-8');
	}

	private prepareUserData(user: User): any {
		return {
			...user,
			profile: user.profile,
			fullName: `${user.profile.lastName} ${user.profile.firstName} ${user.profile.middleName}`,
			currentDate: new Date().toLocaleDateString('ru-RU'),
		};
	}
}
