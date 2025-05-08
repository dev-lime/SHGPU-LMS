// news/news.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
	constructor(private readonly newsService: NewsService) { }

	@Get()
	findAll() {
		return this.newsService.findAll();
	}

	@Get('search')
	search(@Query('q') query: string) {
		return this.newsService.search(query);
	}
}
