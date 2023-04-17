import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TitleModule } from './title/title.module';
import { UsertitleModule } from './user-title/user-title.module';
import { typeORMConfig } from './configs/typeorm.config';
import { AchievemetModule } from './achievemet/achievemet.module';
import { UserAchievemetService } from './user-achievemet/user-achievemet.service';
import { UserAchievemetModule } from './user-achievemet/user-achievemet.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    UserModule,
    TitleModule,
    UsertitleModule,
    AchievemetModule,
    UserAchievemetModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserAchievemetService],
})
export class AppModule {}
