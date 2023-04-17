import { AchievementStatus } from 'src/user-achievemet/dto/enum.achivement.status';
import { UserAchievement } from 'src/user-achievemet/user-achievement.entity';

export class UserCollectablesStatus {
  private collectables: AchievementStatus[];

  constructor(length: number) {
    this.collectables = Array.from(
      { length: length },
      () => AchievementStatus.UNACHIEVED,
    );
  }

  getStatus(id: number): AchievementStatus {
    return this.collectables[id - 1];
  }

  setAchievement(userAchievements: UserAchievement[]) {
    for (const c of userAchievements) {
      this.collectables[c.achievement.id - 1] =
        c.isSelected === true
          ? AchievementStatus.SELECTED
          : AchievementStatus.ACHIEVED;
    }
  }
}
