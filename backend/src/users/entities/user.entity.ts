// users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';
import { UserRole } from '../enums/user-role.enum';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ unique: true })
	email!: string;

	@Column()
	password!: string;

	@Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
	role!: UserRole;

	@OneToOne(() => Profile, { cascade: true })
	@JoinColumn()
	profile!: Profile;
}
