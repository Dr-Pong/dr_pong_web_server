import { Repository } from "typeorm";
import { Rank } from "./rank.entity";

export class RankRepository extends Repository<Rank> {
	async findByUserIdAndSeasonId(userId:number, seasonId:number): Promise<Rank> {
		return await this.findOne({where:{user:{id:userId}, season:{id:seasonId}}});
	}

	async findHighestRankByUserId(userId:number): Promise<Rank> {
		return await this.findOne({where:{user:{id:userId}}, order:{highestPoint:'ASC'}});
	}

	
}