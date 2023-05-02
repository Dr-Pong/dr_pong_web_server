import { BadRequestException, Injectable } from "@nestjs/common";
import { In, IsNull, Not, Repository } from "typeorm";
import { UserAchievement } from "./user-achievement.entity";

export class UserAchievementRepository extends Repository<UserAchievement> {
	async findAllByUserId(userId:number): Promise<UserAchievement[]> {
		return await this.find({where:{user:{id:userId}}});
	}

	async findAllByUserIdAndSelected(userId:number): Promise<UserAchievement[]> {
		return await this.find({where:{user:{id:userId}, selectedOrder:Not(IsNull())}});
	}

	async findAllByUserIdAndAchievementIds(userId: number, achievementIds:number[]): Promise<UserAchievement[]> {
		const achievements =  await this.find({where: {user: { id: userId },achievement: { id: In(achievementIds) },},});
		const countNumbers = achievementIds.filter(
			(elem) => typeof elem === 'number',
		  ).length;
		  if (countNumbers !== achievements.length) {
			throw new BadRequestException('No such achievement');
		}
		return achievements;
	}

	async updateSelectedOrderNull(userAchievement: UserAchievement): Promise<void> {
		userAchievement.selectedOrder = null;
		await this.save(userAchievement);
	}

	async updateSelectedOrder(userAchievement: UserAchievement, order:number): Promise<void> {
		userAchievement.selectedOrder = order;
		await this.save(userAchievement);
	}
}