import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
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
        where: { user: { id: getDto.userId }, selectedOrder: Not(null) },
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

  //patch user achievement Patch 가 old 랑 to_change로 저장하고 return 하는 로직을 구현해야한다
  async patchUserAchievements(
    patchDto: PatchUserAchievementsDto,
  ): Promise<void> {
    const old_achievements: UserAchievement[] =
      await this.userAchievementRepository.find({
        where: {
          user: { id: patchDto.userId },
          selectedOrder: Not(null),
        },
      });
    const to_change_achievement: UserAchievement[] =
      await this.userAchievementRepository.find({
        where: {
          user: { id: patchDto.userId },
          achievement: In(patchDto.achievementsId),
        },
      });
    if (to_change_achievement.length !== patchDto.achievementsId.length) {
      throw new BadRequestException('No such Achievement');
    }
    for (const c of to_change_achievement) {
      c.selectedOrder = null;
    }
    for (const c of to_change_achievement) {
      let i = 0;
      for (const d of patchDto.achievementsId) {
        if (c.achievement.id === d) {
          c.selectedOrder = i;
          break;
        }
        i++;
      }
    }
    await this.userAchievementRepository.save(old_achievements);
    await this.userAchievementRepository.save(to_change_achievement);
  }
}
