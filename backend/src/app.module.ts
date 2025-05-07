// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessengerModule } from './messenger/messenger.module';
import { NewsModule } from './news/news.module';
import { ScheduleModule } from './schedule/schedule.module';
import { DocumentsModule } from './documents/documents.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get<string>('DB_HOST'),
				port: configService.get<number>('DB_PORT'),
				username: configService.get<string>('DB_USERNAME'),
				password: configService.get<string>('DB_PASSWORD'),
				database: configService.get<string>('DB_NAME'),
				entities: [__dirname + '/**/*.entity{.ts,.js}'],
				synchronize: configService.get<string>('NODE_ENV') !== 'production',
				logging: configService.get<string>('NODE_ENV') === 'development',
			}),
			inject: [ConfigService],
		}),
		CacheModule.register({
			isGlobal: true,
			ttl: 3600, // 1 час
			max: 100, // Максимальное количество элементов в кэше
		}),
		AuthModule,
		UsersModule,
		MessengerModule,
		NewsModule,
		ScheduleModule,
		DocumentsModule,
	],
})
export class AppModule { }
