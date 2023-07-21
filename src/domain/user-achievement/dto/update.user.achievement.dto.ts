export class UpdateUserAchievementDto {
  userId: number;
  achievement: string;
  imgUrl: string;

  constructor(userId: number, achievement: string, imgUrl: string) {
    this.userId = userId;
    this.achievement = achievement;
    this.imgUrl = imgUrl;
  }
}

export class UpdateUserAchievementsDto {
  updateAchievements: UpdateUserAchievementDto[];
}
