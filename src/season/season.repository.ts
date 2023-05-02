import { Repository } from "typeorm";
import { Season } from "./season.entity";

export class SeasonRepository extends Repository<Season> {
	async findCurrentSeason(): Promise<Season> {
		return await this.findOne({order:{createdAt:'DESC'}});
	}
}