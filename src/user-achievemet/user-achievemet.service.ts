import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { UserAchievement } from './user-achievement.entity';
import { GetUserAchievementsDto } from './dto/get.user.achievements.dto';
import {
  UserAchievementDto,
  UserAchievementsDto,
} from './dto/user.achievements.dto';
import { AchievementStatus } from './dto/enum.achivement.status';
import { Achievemet } from 'src/achievemet/achievement.entity';

@Injectable()
export class UserAchievemetService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(Achievemet)
    private achievementRepository: Repository<Achievemet>,
  ) {}

  async getUserAchievements(
    getDto: GetUserAchievementsDto,
  ): Promise<UserAchievementsDto> {
    if (getDto.isSelected == true) {
      //achieved이고 selected된 업적 return
      const selectAchievement = await this.userAchievementRepository.find({
        where: { user: { id: getDto.userId }, isSelected: true },
      });
      const achievements = selectAchievement.map((userAchievement) => {
        return {
          id: userAchievement.achievement.id,
          name: userAchievement.achievement.name,
          status: AchievementStatus.SELECTED,
        };
      });
      const responseDto: UserAchievementsDto = {
        achievements: achievements,
      };
      return responseDto;
    }
    //achieved이고 selected되지 않은 업적 return
    const allAchievement = await this.achievementRepository.find();
    const userAchievement = await this.userAchievementRepository.find({
      where: { user: { id: getDto.userId } },
    });
    const achievements: UserAchievementDto[] = [];
    const status = Array.from(
      { length: allAchievement.length },
      () => AchievementStatus.UNACHIEVED,
    );

    for (const c of userAchievement) {
      if (c.isSelected)
        status[c.achievement.id - 1] = AchievementStatus.SELECTED;
      else status[c.achievement.id - 1] = AchievementStatus.ACHIEVED;
    }

    for (const c of allAchievement) {
      achievements.push({
        id: c.id,
        name: c.name,
        status: status[c.id - 1],
      });
    }

    const responseDto: UserAchievementsDto = {
      achievements: achievements,
    };
    return responseDto;
  }
}
