import { AchievementStatus } from './enum.achivement.status';

export class UserAchievementDto {
  id: number;

  name: string;

  status: AchievementStatus;
}

export class UserAchievementsDto {
  achievements: UserAchievementDto[];
}
