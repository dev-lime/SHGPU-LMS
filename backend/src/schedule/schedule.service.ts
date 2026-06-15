// schedule.service.ts
import { Injectable } from '@nestjs/common';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
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

	async getGroupSchedule(groupId: string, week?: number): Promise<Lesson[]> {
		const cacheKey = `schedule_group_${groupId}_${week || 'current'}`;
		const cached = await this.cacheManager.get<Lesson[]>(cacheKey);

		if (cached) {
			return cached;
		}

		const schedule = await this.lessonRepository.find({
			where: { group: { id: groupId } },
			relations: ['teacher', 'classroom'],
			order: { weekDay: 'ASC', startTime: 'ASC' },
		});

		await this.cacheManager.set(cacheKey, schedule, 3600);
		return schedule;
	}

	async getCurrentLesson(groupId: string) {
		const now = new Date();
		const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
		const currentTime = `${now.getHours()}:${now.getMinutes()}`;

		const schedule = await this.getGroupSchedule(groupId);
		return schedule.find((lesson: Lesson) => {
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

			await this.cacheManager.clear();
		} catch (error) {
			// Обработка ошибок
		}
	}
}
