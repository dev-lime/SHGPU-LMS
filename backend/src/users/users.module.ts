// users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Profile } from './entities/profile.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Profile]),
		MulterModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				storage: diskStorage({
					destination: configService.get<string>('UPLOAD_DIR'),
					filename: (req, file, cb) => {
						const randomName = Array(32)
							.fill(null)
							.map(() => Math.round(Math.random() * 16).toString(16))
							.join('');
						return cb(null, `${randomName}${extname(file.originalname)}`);
					},
				}),
				limits: {
					fileSize: 5 * 1024 * 1024, // 5MB
				},
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule { }
