import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
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
export class UserAchievementService {
  constructor(
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(Achievemet)
    private achievementRepository: Repository<Achievemet>,
  ) {}

  async getUserAchievementsAll(
    getDto: GetUserAchievementsDto,
  ): Promise<UserAchievementsDto> {
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

  //get user achievements
  async getUserAchievementsSelected(
    getDto: GetUserAchievementsDto,
  ): Promise<UserAchievementsDto> {
    //achieved이고 selected된 업적 return
    const selectAchievement = await this.userAchievementRepository.find({
      where: { user: { id: getDto.userId }, selectedOrder: Not(IsNull()) },
    });
    const achievements: UserAchievementDto[] = [null, null, null];
    for (const userAchievement of selectAchievement) {
      achievements[userAchievement.selectedOrder] = {
        id: userAchievement.achievement.id,
        name: userAchievement.achievement.name,
        status: CollectableStatus.SELECTED,
      };
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
    const oldAchievements: UserAchievement[] =
      await this.userAchievementRepository.find({
        where: {
          user: { id: patchDto.userId },
          selectedOrder: Not(IsNull()),
        },
      });
    const toChangeAchievement: UserAchievement[] =
      await this.userAchievementRepository.find({
        where: {
          user: { id: patchDto.userId },
          achievement: { id: In(patchDto.achievementsId) },
        },
      });
    const countNumbers = patchDto.achievementsId.filter(
      (elem) => typeof elem === 'number',
    ).length;
    if (countNumbers !== toChangeAchievement.length) {
      throw new BadRequestException('No such achievement');
    }

    for (const c of toChangeAchievement) {
      c.selectedOrder = null;
    }
    for (const c of toChangeAchievement) {
      let i = 0;
      for (const d of patchDto.achievementsId) {
        if (c.achievement.id === d) {
          c.selectedOrder = i;
          break;
        }
        i++;
      }
    }
    await this.userAchievementRepository.save(oldAchievements);
    await this.userAchievementRepository.save(toChangeAchievement);
  }
}
