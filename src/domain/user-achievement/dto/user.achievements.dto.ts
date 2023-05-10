import { CollectableStatus } from "src/global/type/type.collectable.status";

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
