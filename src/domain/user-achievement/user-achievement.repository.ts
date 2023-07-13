import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { UserAchievement } from './user-achievement.entity';

@Injectable()
export class UserAchievementRepository {
  constructor(
    @InjectRepository(UserAchievement)
    private readonly repository: Repository<UserAchievement>,
  ) {}
  async findAllByUserId(userId: number): Promise<UserAchievement[]> {
    return await this.repository.find({ where: { user: { id: userId } } });
  }

  async findAllByUserIdAndSelected(userId: number): Promise<UserAchievement[]> {
    return await this.repository.find({
      where: { user: { id: userId }, selectedOrder: Not(IsNull()) },
    });
  }

  async findAllByUserIdAndAchievementIds(
    userId: number,
    achievementIds: number[],
  ): Promise<UserAchievement[]> {
    return await this.repository.find({
      where: { user: { id: userId }, achievement: { id: In(achievementIds) } },
    });
  }

  async updateSelectedOrderNull(
    userAchievement: UserAchievement,
  ): Promise<void> {
    userAchievement.selectedOrder = null;
    await this.repository.save(userAchievement);
  }

  async updateSelectedOrder(
    userAchievement: UserAchievement,
    order: number,
  ): Promise<void> {
    userAchievement.selectedOrder = order;
    await this.repository.save(userAchievement);
  }

  async save(userId: number, achievementId: number): Promise<void> {
    await this.repository.save({
      user: { id: userId },
      achievement: { id: achievementId },
    });
  }
}
