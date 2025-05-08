// schedule/entities/classroom.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Classroom {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	number!: string;

	@Column()
	building!: string;
}
