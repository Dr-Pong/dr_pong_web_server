import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from 'src/achievement/achievement.entity';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserAchievement } from './user-achievement.entity';
import { UserAchievementService } from './user-achievement.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAchievement, Achievement])],
  providers: [UserAchievementService],
  exports: [
    TypeOrmModule.forFeature([User, UserAchievement, Achievement]),
    UserAchievementService,
  ],
})
export class UserAchievementModule {}
