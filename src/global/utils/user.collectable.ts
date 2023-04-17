import { AchievementStatus } from 'src/user-achievemet/dto/enum.achivement.status';

export class UserCollectable {
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

  setStatus(id: number, status: AchievementStatus) {
    this.collectables[id - 1] = status;
  }
}
