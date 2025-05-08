// users/entities/profile.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Profile {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	firstName!: string;

	@Column()
	lastName!: string;

	@Column({ nullable: true })
	middleName?: string;

	@Column({ nullable: true })
	avatar?: string;

	@Column({ nullable: true })
	group?: string;

	@Column({ nullable: true })
	course?: number;
}
