// documents.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';
import { User } from '../users/entities/user.entity';
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

		const templatePath = path.join(
			process.cwd(),
			'templates',
			`${template.templateFile}.hbs`,
		);
		const templateContent = fs.readFileSync(templatePath, 'utf-8');

		const compiledTemplate = compile(templateContent);
		const data = this.prepareUserData(user);
		const result = compiledTemplate(data);

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
