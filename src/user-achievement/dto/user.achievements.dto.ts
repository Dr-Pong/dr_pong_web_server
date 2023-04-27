import { CollectableStatus } from '../../global/type/enum.collectable.status';

export class UserAchievementDto {
  id: number;

  name: string;

  imgUrl: string;

  content: string;

  status: CollectableStatus;
}

export class UserAchievementsDto {
  achievements: UserAchievementDto[];
}
