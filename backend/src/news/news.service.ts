// news/news.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsItem } from './entities/news-item.entity';

@Injectable()
export class NewsService {
	constructor(
		@InjectRepository(NewsItem)
		private newsRepository: Repository<NewsItem>,
	) { }

	async findAll(): Promise<NewsItem[]> {
		return this.newsRepository.find({ order: { date: 'DESC' } });
	}

	async findOne(id: string): Promise<NewsItem | null> {
		return this.newsRepository.findOne({ where: { id } });
	}

	async search(query: string): Promise<NewsItem[]> {
		return this.newsRepository
			.createQueryBuilder('news')
			.where('news.title LIKE :query OR news.content LIKE :query', { query: `%${query}%` })
			.orderBy('news.date', 'DESC')
			.getMany();
	}
}
