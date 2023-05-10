import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './domain/user/user.module';
import { TitleModule } from './domain/title/title.module';
import { UsertitleModule } from './domain/user-title/user-title.module';
import { typeORMConfig } from './configs/typeorm.config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { UserAchievementModule } from './domain/user-achievement/user-achievement.module';
import { AuthModule } from './auth/auth.module';
import { TestModule } from './test/test.module';
import { RankModule } from './domain/rank/rank.module';
import { SeasonModule } from './domain/season/season.module';
import { AchievementModule } from './domain/achievement/achievement.module';
import { DataSource } from 'typeorm';
import { ProfileImageModule } from './domain/profile-image/profile-image.module';
import { UserGameModule } from './domain/user-game/user-game.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory() {
        return typeORMConfig;
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        return addTransactionalDataSource({
          dataSource: new DataSource(options),
        });
      },
    }),
    UserModule,
    TitleModule,
    RankModule,
    SeasonModule,
    UsertitleModule,
    AchievementModule,
    UserAchievementModule,
    AuthModule,
    TestModule,
    ProfileImageModule,
    UserGameModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
