// news.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NewsItem } from './entities/news-item.entity';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ParserService } from './parser.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([NewsItem]),
		HttpModule,
		ScheduleModule.forRoot(),
	],
	controllers: [NewsController],
	providers: [NewsService, ParserService],
})
export class NewsModule { }
