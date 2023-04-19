import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAchievement } from './user-achievement.entity';
import { GetUserAchievementsDto } from './dto/get.user.achievements.dto';
import {
  UserAchievementDto,
  UserAchievementsDto,
} from './dto/user.achievements.dto';
import { CollectableStatus } from '../global/type/enum.collectable.status';
import { Achievemet } from 'src/achievemet/achievement.entity';
import { UserCollectablesStatus } from 'src/global/utils/user.collectable';
import { PatchUserAchievementsDto } from './dto/patch.user.achievements.dto';

@Injectable()
export class UserAchievemetService {
  constructor(
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(Achievemet)
    private achievementRepository: Repository<Achievemet>,
  ) {}

  //get user achievements
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
          status: CollectableStatus.SELECTED,
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
    const status = new UserCollectablesStatus(allAchievement.length);
    status.setStatus(userAchievement); // userAchievement 에 있는 status 를 allAchievement 에 변경

    for (const c of allAchievement) {
      achievements.push({
        id: c.id,
        name: c.name,
        status: status.getStatus(c.id),
      });
    }

    const responseDto: UserAchievementsDto = {
      achievements: achievements,
    };
    return responseDto;
  }

  //patch user achievement
  async patchUserAchievements(getDto: PatchUserAchievementsDto): Promise<void> {
    const savedAchievements: UserAchievement[] = [];
    for (const achieveId of getDto.achievementsId) {
      const userAchievement = await this.userAchievementRepository.findOne({
        where: {
          user: { id: getDto.userId },
          achievement: { id: achieveId },
        },
      });
      if (!userAchievement) {
        throw new BadRequestException('No such Achievements');
      }
      savedAchievements.push(userAchievement);
    }
    for (const c of savedAchievements) {
      c.isSelected = true;
    }
    await this.userAchievementRepository.save(savedAchievements);
  }
}
