import { Repository } from "typeorm";
import { Achievement } from "./achievement.entity";

export class AchievementRepository extends Repository<Achievement> {
	async findAll(): Promise<Achievement[]> {
		return await this.find();
	}
}