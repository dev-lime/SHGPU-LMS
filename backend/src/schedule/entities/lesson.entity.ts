// entities/lesson.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Group } from './group.entity';
import { Teacher } from './teacher.entity';
import { Classroom } from './classroom.entity';

@Entity()
export class Lesson {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column()
	weekDay: number; // 0-6 (ПН-ВС)

	@Column()
	startTime: string; // "HH:MM"

	@Column()
	endTime: string; // "HH:MM"

	@ManyToOne(() => Group)
	group: Group;

	@ManyToOne(() => Teacher)
	teacher: Teacher;

	@ManyToOne(() => Classroom)
	classroom: Classroom;

	@Column()
	weekType: 'odd' | 'even' | 'both'; // Четная/нечетная неделя
}
