// schedule.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { Lesson } from './entities/lesson.entity';
import { Group } from './entities/group.entity';
import { Teacher } from './entities/teacher.entity';
import { Classroom } from './entities/classroom.entity';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		TypeOrmModule.forFeature([Lesson, Group, Teacher, Classroom]),
		HttpModule,
		CacheModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				ttl: configService.get<number>('CACHE_TTL', 3600),
				max: configService.get<number>('CACHE_MAX', 100),
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [ScheduleController],
	providers: [ScheduleService],
})
export class ScheduleModule { }
