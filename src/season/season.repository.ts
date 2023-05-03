import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Season } from "./season.entity";

@Injectable()
export class SeasonRepository {
	constructor(
		@InjectRepository(Season)
		private readonly repository: Repository<Season>,
	) {}

	async findCurrentSeason(): Promise<Season> {
		return await this.repository.findOne({order:{createdAt:'DESC'}});
	}
}