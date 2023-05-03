import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rank } from "./rank.entity";

@Injectable()
export class RankRepository {
	constructor(
		@InjectRepository(Rank)
		private readonly repository: Repository<Rank>,
	) {}

	async findByUserIdAndSeasonId(userId:number, seasonId:number): Promise<Rank> {
		return await this.repository.findOne({where:{user:{id:userId}, season:{id:seasonId}}});
	}

	async findHighestRankByUserId(userId:number): Promise<Rank> {
		return await this.repository.findOne({where:{user:{id:userId}}, order:{highestPoint:'ASC'}});
	}

	
}