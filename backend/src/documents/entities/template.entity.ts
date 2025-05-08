// documents/entities/template.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Template {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	name!: string;

	@Column()
	templateFile!: string;

	@Column({ type: 'json', nullable: true })
	fields?: Record<string, any>;
}
