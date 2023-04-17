import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievemet } from 'src/achievemet/achievement.entity';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserAchievement } from './user-achievement.entity';
import { UserAchievemetService } from './user-achievemet.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAchievement, Achievemet])],
  providers: [UserAchievemetService],
  exports: [TypeOrmModule.forFeature([UserAchievement]), UserAchievemetService],
})
export class UserAchievemetModule {}
