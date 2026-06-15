import { IsEmail, IsString, IsOptional, IsEnum, IsNumber, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';

class UpdateProfileDto {
	@IsOptional()
	@IsString()
	firstName?: string;

	@IsOptional()
	@IsString()
	lastName?: string;

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

export class UpdateUserDto {
	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	@MinLength(6)
	password?: string;

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;

	@IsOptional()
	@ValidateNested()
	@Type(() => UpdateProfileDto)
	profile?: UpdateProfileDto;
}
