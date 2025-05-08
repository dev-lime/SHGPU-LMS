// schedule/entities/lesson.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Group } from './group.entity';
import { Teacher } from './teacher.entity';
import { Classroom } from './classroom.entity';

@Entity()
export class Lesson {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	name!: string;

	@Column()
	weekDay!: number;

	@Column()
	startTime!: string;

	@Column()
	endTime!: string;

	@ManyToOne(() => Group)
	group!: Group;

	@ManyToOne(() => Teacher)
	teacher!: Teacher;

	@ManyToOne(() => Classroom)
	classroom!: Classroom;

	@Column({ type: 'enum', enum: ['odd', 'even', 'both'] })
	weekType!: 'odd' | 'even' | 'both';
}
