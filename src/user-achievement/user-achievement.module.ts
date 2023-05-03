import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from 'src/achievement/achievement.entity';
import { AchievementRepository } from 'src/achievement/achievement.repository';
import { User } from 'src/user/user.entity';
import { UserAchievement } from './user-achievement.entity';
import { UserAchievementRepository } from './user-achievement.repository';
import { UserAchievementService } from './user-achievement.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserAchievement, Achievement])],
  providers: [UserAchievementService, UserAchievementRepository, AchievementRepository],
  exports: [
    UserAchievementService,
  ],
})
export class UserAchievementModule {}
