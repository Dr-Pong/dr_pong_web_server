export class UpDateUserAchievementDto {
  userId: number;
  achievementId: number;

  constructor(userId: number, achievementId: number) {
    this.userId = userId;
    this.achievementId = achievementId;
  }
}

export class UserAchievementsDto {
  updateAchievements: UpDateUserAchievementDto[];
}
