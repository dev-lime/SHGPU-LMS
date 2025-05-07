// parser.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CheerioAPI, load } from 'cheerio';
import { NewsItem } from './entities/news-item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ParserService {
	private readonly logger = new Logger(ParserService.name);

	constructor(
		private httpService: HttpService,
		@InjectRepository(NewsItem)
		private newsRepository: Repository<NewsItem>,
	) { }

	@Cron('0 */30 * * * *') // Каждые 30 минут
	async parseNews() {
		try {
			const response = await firstValueFrom(
				this.httpService.get('https://university-site.edu/news'),
			);

			const $ = load(response.data);
			const newsItems: Partial<NewsItem>[] = [];

			$('.news-item').each((i, elem) => {
				const title = $(elem).find('.news-title').text().trim();
				const content = $(elem).find('.news-content').text().trim();
				const date = $(elem).find('.news-date').text().trim();
				const image = $(elem).find('img').attr('src') || null;

				newsItems.push({
					title,
					content,
					date: new Date(date),
					imageUrl: image,
					sourceUrl: $(elem).find('a').attr('href'),
				});
			});

			await this.saveNews(newsItems);
		} catch (error) {
			this.logger.error('Error parsing news', error.stack);
		}
	}

	private async saveNews(newsItems: Partial<NewsItem>[]) {
		for (const item of newsItems) {
			const exists = await this.newsRepository.findOne({
				where: { title: item.title, date: item.date }
			});

			if (!exists) {
				await this.newsRepository.save(item);
			}
		}
	}
}
