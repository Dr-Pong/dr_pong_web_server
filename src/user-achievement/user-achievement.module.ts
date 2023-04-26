import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievemet } from 'src/achievemet/achievement.entity';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserAchievement } from './user-achievement.entity';
import { UserAchievementService } from './user-achievement.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAchievement, Achievemet])],
  providers: [UserAchievementService],
  exports: [TypeOrmModule.forFeature([UserAchievement]), UserAchievementService],
})
export class UserAchievementModule {}
