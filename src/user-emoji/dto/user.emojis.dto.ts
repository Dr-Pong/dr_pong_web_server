import { CollectableStatus } from 'src/global/type/enum.collectable.status';

export class UserEmojiDto {
  id: number;

  name: string;

  status: CollectableStatus;
}

export class UseremojisDto {
  emojis: UserEmojiDto[];
}
