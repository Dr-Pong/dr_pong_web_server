import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { UserEmoji } from './user-emoji.entity';

@Injectable()
export class UserEmojiRepository {
  constructor(
    @InjectRepository(UserEmoji)
    private readonly repository: Repository<UserEmoji>,
  ) {}
  async findAllByUserId(userId: number): Promise<UserEmoji[]> {
    return await this.repository.find({ where: { user: { id: userId } } });
  }

  async findAllByUserIdAndSelected(userId: number): Promise<UserEmoji[]> {
    return await this.repository.find({
      where: { user: { id: userId }, selectedOrder: Not(IsNull()) },
    });
  }

  async findAllByUserIdAndEmojiIds(
    userId: number,
    emojiIds: number[],
  ): Promise<UserEmoji[]> {
    return await this.repository.find({
      where: { user: { id: userId }, emoji: { id: In(emojiIds) } },
    });
  }

  async updateSelectedOrderNull(userEmoji: UserEmoji): Promise<void> {
    userEmoji.selectedOrder = null;
    await this.repository.save(userEmoji);
  }

  async updateSelectedOrder(
    userEmoji: UserEmoji,
    order: number,
  ): Promise<void> {
    userEmoji.selectedOrder = order;
    await this.repository.save(userEmoji);
  }

  async save(userId: number, emojiId: number): Promise<void> {
    await this.repository.save({
      user: { id: userId },
      emoji: { id: emojiId },
    });
  }
}
