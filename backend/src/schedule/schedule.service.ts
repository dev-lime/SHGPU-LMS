// schedule.service.ts
import { Injectable } from '@nestjs/common';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Group } from './entities/group.entity';

@Injectable()
export class ScheduleService {
	constructor(
		@InjectRepository(Lesson)
		private lessonRepository: Repository<Lesson>,
		@InjectRepository(Group)
		private groupRepository: Repository<Group>,
		private httpService: HttpService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) { }

	async getGroupSchedule(groupId: string, week?: number) {
		const cacheKey = `schedule_group_${groupId}_${week || 'current'}`;
		const cached = await this.cacheManager.get(cacheKey);

		if (cached) {
			return cached;
		}

		const schedule = await this.lessonRepository.find({
			where: { group: { id: groupId } },
			relations: ['teacher', 'classroom'],
			order: { weekDay: 'ASC', startTime: 'ASC' },
		});

		await this.cacheManager.set(cacheKey, schedule, 3600); // Кэш на 1 час
		return schedule;
	}

	async getCurrentLesson(groupId: string) {
		const now = new Date();
		const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Приводим к формату 0-6 (ПН-ВС)
		const currentTime = `${now.getHours()}:${now.getMinutes()}`;

		const schedule = await this.getGroupSchedule(groupId);
		return schedule.find(lesson => {
			return (
				lesson.weekDay === dayOfWeek &&
				lesson.startTime <= currentTime &&
				lesson.endTime >= currentTime
			);
		});
	}

	async syncWithUniversityApi() {
		try {
			const response = await firstValueFrom(
				this.httpService.get('https://university-api.edu/schedule'),
			);

			// Обработка и сохранение данных
			// ...

			// Очистка кэша
			await this.cacheManager.reset();
		} catch (error) {
			// Обработка ошибок
		}
	}
}
