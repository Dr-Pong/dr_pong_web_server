import { CollectableStatus } from "src/global/type/type.collectable.status";

export class UserEmojiDto {
  id: number;

  name: string;

  imgUrl: string;

  status: CollectableStatus;
}

export class UseremojisDto {
  emojis: UserEmojiDto[];
}
