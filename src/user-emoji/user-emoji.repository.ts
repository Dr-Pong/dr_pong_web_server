import { BadRequestException } from "@nestjs/common";
import { In, IsNull, Not, Repository } from "typeorm";
import { UserEmoji } from "./user-emoji.entity";

export class UserEmojiRepository extends Repository<UserEmoji> {
	async findAllByUserId(userId:number): Promise<UserEmoji[]> {
		return await this.find({where:{user:{id:userId}}});
	}

	async findAllByUserIdAndSelected(userId:number): Promise<UserEmoji[]> {
		return await this.find({where:{user:{id:userId}, selectedOrder:Not(IsNull())}});
	}

	async findAllByUserIdAndEmojiIds(userId: number, emojiIds:number[]): Promise<UserEmoji[]> {
		return await this.find({where: {user: { id: userId },emoji: { id: In(emojiIds) },},});
	}

	async updateSelectedOrderNull(userEmoji: UserEmoji): Promise<void> {
		userEmoji.selectedOrder = null;
		await this.save(userEmoji);
	}

	async updateSelectedOrder(userEmoji: UserEmoji, order:number): Promise<void> {
		userEmoji.selectedOrder = order;
		await this.save(userEmoji);
	}
}