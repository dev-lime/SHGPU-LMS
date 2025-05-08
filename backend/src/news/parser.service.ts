// news/parser.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsItem } from './entities/news-item.entity';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

@Injectable()
export class ParserService {
	private readonly logger = new Logger(ParserService.name);

	constructor(
		private readonly httpService: HttpService,
		@InjectRepository(NewsItem)
		private newsRepository: Repository<NewsItem>,
	) { }

	private readonly categories = [
		{
			name: 'Новости науки',
			url: 'https://shspu.ru/news-science/',
		},
		{
			name: 'Новости спорта',
			url: 'https://shspu.ru/news-sport/',
		},
		{
			name: 'Студенческая жизнь',
			url: 'https://shspu.ru/news-student/',
		},
		{
			name: 'Новости университета',
			url: 'https://shspu.ru/news-university/',
		},
	];

	@Cron('0 */30 * * * *')
	async handleCron() {
		this.logger.log('Запуск парсинга новостей');
		await this.parseAllNews();
	}

	async parseAllNews(): Promise<void> {
		try {
			const allNews: Partial<NewsItem>[] = [];
			const uniqueUrls = new Set<string>();

			for (const category of this.categories) {
				this.logger.log(`Парсинг категории: ${category.name}`);
				const newsItems = await this.parseNewsPage(category.url);

				for (const newsItem of newsItems.slice(0, 10)) {
					if (newsItem.sourceUrl && !uniqueUrls.has(newsItem.sourceUrl)) {
						uniqueUrls.add(newsItem.sourceUrl);
						const fullNews = await this.parseFullNews(newsItem);
						if (fullNews) {
							allNews.push(fullNews);
						}
					}
				}
			}

			await this.saveNews(allNews);
			this.logger.log(`Парсинг завершен. Обработано ${allNews.length} новостей`);
		} catch (error: unknown) {
			this.logger.error('Ошибка при парсинге новостей', error instanceof Error ? error.stack : String(error));
		}
	}

	private async parseNewsPage(url: string): Promise<Partial<NewsItem>[]> {
		try {
			const response = await firstValueFrom(this.httpService.get(url));
			const $ = cheerio.load(response.data);
			const newsItems: Partial<NewsItem>[] = [];

			$('.col-news-panel').each((i, element) => {
				const newsItem = $(element).find('.news-panel');
				const title = newsItem.find('.news-title h4').text().trim();
				const date = newsItem.find('.news-date').text().trim();
				const image = newsItem.find('img').attr('src') || undefined;
				const link = newsItem.find('a').first().attr('href');

				const fullImageUrl = image ? new URL(image, 'https://shspu.ru/').toString() : undefined;
				const fullLink = link ? new URL(link, 'https://shspu.ru/').toString() : undefined;

				if (title && date && fullLink) {
					newsItems.push({
						title,
						date: new Date(date),
						imageUrl: fullImageUrl,
						sourceUrl: fullLink,
					});
				}
			});

			return newsItems;
		} catch (error: unknown) {
			this.logger.error(`Ошибка при парсинге страницы ${url}`, error instanceof Error ? error.message : String(error));
			return [];
		}
	}

	private async parseFullNews(newsItem: Partial<NewsItem>): Promise<Partial<NewsItem> | null> {
		if (!newsItem.sourceUrl) return null;

		try {
			const response = await firstValueFrom(this.httpService.get(newsItem.sourceUrl));
			const $ = cheerio.load(response.data);

			let content = '';
			const contentDiv = $('div[id^="c"] .csc-default p').first();
			if (contentDiv.length) {
				content = contentDiv.text().trim();
			}

			if (!content) {
				content = $('.content-full-news p, .full-news p').first().text().trim();
			}

			if (!content) {
				content = $('meta[name="description"]').attr('content') || '';
			}

			if (content.startsWith('Фото:') || content.includes('©')) {
				content = '';
			}

			return {
				...newsItem,
				content: content || 'Текст новости не найден',
			};
		} catch (error: unknown) {
			this.logger.error(
				`Ошибка при парсинге полной новости ${newsItem.sourceUrl}`,
				error instanceof Error ? error.message : String(error)
			);
			return null;
		}
	}

	private async saveNews(newsItems: Partial<NewsItem>[]): Promise<void> {
		for (const item of newsItems) {
			if (!item.sourceUrl) continue;

			const existing = await this.newsRepository.findOne({
				where: { sourceUrl: item.sourceUrl }
			});

			if (!existing) {
				await this.newsRepository.save(item);
			} else if (existing && this.isNewsUpdated(existing, item)) {
				await this.newsRepository.update(existing.id, item);
			}
		}
	}

	private isNewsUpdated(existing: NewsItem, newItem: Partial<NewsItem>): boolean {
		return (
			existing.title !== newItem.title ||
			existing.content !== newItem.content ||
			(existing.imageUrl !== newItem.imageUrl && newItem.imageUrl !== undefined)
		);
	}
}
