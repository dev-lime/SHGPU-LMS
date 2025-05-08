// news/entities/news-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class NewsItem {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	title!: string;

	@Column('text')
	content!: string;

	@Column()
	date!: Date;

	@Column({ nullable: true })
	imageUrl?: string;

	@Column({ nullable: true })
	sourceUrl?: string;
}
