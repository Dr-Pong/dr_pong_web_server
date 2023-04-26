import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TitleModule } from './title/title.module';
import { UsertitleModule } from './user-title/user-title.module';
import { typeORMConfig } from './configs/typeorm.config';
import { AchievemetModule } from './achievemet/achievemet.module';
import { UserAchievementService } from './user-achievement/user-achievement.service';
import { UserAchievementModule } from './user-achievement/user-achievement.module';
import { AuthModule } from './auth/auth.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    UserModule,
    TitleModule,
    UsertitleModule,
    AchievemetModule,
    UserAchievementModule,
    AuthModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
