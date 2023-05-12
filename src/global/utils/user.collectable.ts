import { UserAchievement } from 'src/domain/user-achievement/user-achievement.entity';
import { UserEmoji } from 'src/domain/user-emoji/user-emoji.entity';
import {
  CollectableStatus,
  COLLECTABLE_ACHIEVED,
  COLLECTABLE_SELECTED,
  COLLECTABLE_UNACHIEVED,
} from '../type/type.collectable.status';

export class UserCollectablesStatus {
  private collectables: CollectableStatus[];

  constructor(length: number) {
    this.collectables = Array.from(
      { length: length },
      () => COLLECTABLE_UNACHIEVED,
    );
  }

  getStatus(id: number): CollectableStatus {
    return this.collectables[id - 1];
  }

  setStatus(userCollectable: UserAchievement[] | UserEmoji[]) {
    for (const c of userCollectable) {
      const id = c instanceof UserAchievement ? c.achievement.id : c.emoji.id;
      this.collectables[id - 1] =
        c.selectedOrder !== null ? COLLECTABLE_SELECTED : COLLECTABLE_ACHIEVED;
    }
  }
}
