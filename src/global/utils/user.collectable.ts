import { CollectableStatus } from 'src/global/type/enum.collectable.status';
import { UserAchievement } from 'src/user-achievemet/user-achievement.entity';

export class UserCollectablesStatus {
  private collectables: CollectableStatus[];

  constructor(length: number) {
    this.collectables = Array.from(
      { length: length },
      () => CollectableStatus.UNACHIEVED,
    );
  }

  getStatus(id: number): CollectableStatus {
    return this.collectables[id - 1];
  }

  setStatus(usercollectable: UserAchievement[]) {
    for (const c of usercollectable) {
      this.collectables[c.achievement.id - 1] =
        c.isSelected === true
          ? CollectableStatus.SELECTED
          : CollectableStatus.ACHIEVED;
    }
  }
}
