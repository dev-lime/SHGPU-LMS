import { IsEmail, IsString, IsOptional, IsEnum, IsNumber, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';

class CreateProfileDto {
	@IsString()
	firstName!: string;

	@IsString()
	lastName!: string;

	@IsOptional()
	@IsString()
	middleName?: string;

	@IsOptional()
	@IsString()
	group?: string;

	@IsOptional()
	@IsNumber()
	course?: number;
}

export class CreateUserDto {
	@IsEmail()
	email!: string;

	@IsString()
	@MinLength(6)
	password!: string;

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;

	@ValidateNested()
	@Type(() => CreateProfileDto)
	profile!: CreateProfileDto;
}
