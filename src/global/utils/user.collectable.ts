import { CollectableStatus } from 'src/global/type/enum.collectable.status';
import { UserAchievement } from 'src/user-achievement/user-achievement.entity';
import { UserEmoji } from 'src/user-emoji/user-emoji.entity';

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

  setStatus(userCollectable: UserAchievement[] | UserEmoji[]) {
    for (const c of userCollectable) {
      const id = c instanceof UserAchievement ? c.achievement.id : c.emoji.id;
      this.collectables[id - 1] =
        c.selectedOrder !== null
          ? CollectableStatus.SELECTED
          : CollectableStatus.ACHIEVED;
    }
  }
}
