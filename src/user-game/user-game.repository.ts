import { Injectable } from "@nestjs/common";
import { In, IsNull, Not, Repository } from "typeorm";
import { UserGame } from "./user-game.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Game } from "src/game/game.entity";
import { GetUserGameRecordsDto } from "./dto/get.user-game.records.dto";

@Injectable()
export class UserGameRepository {
	constructor(
		@InjectRepository(UserGame)
		private readonly repository: Repository<UserGame>,
	) { }

	async findAllByUserIdAndGameIdLowerThanLastGameId(getDto: GetUserGameRecordsDto): Promise<any> {
		const gameIds = this.repository
			.createQueryBuilder("user_game")
			.select("user_game.game_id")
			.where(
				"user_game.user_id = :userId and user_game.game_id < :lastGameId",
				{ userId: getDto.userId, lastGameId: getDto.lastGameId }
			)
			.limit(getDto.count + 1);

		const userGames: UserGame[] = await this.repository
			.createQueryBuilder("user_game")
			.leftJoinAndSelect("user_game.game", "game")
			.leftJoinAndSelect("user_game.user", "user")
			.leftJoinAndSelect("user.image", "image")
			.where(`user_game.game_id IN (${gameIds.getQuery()})`)
			.setParameters(gameIds.getParameters())
			.getMany();

		// console.log(gameIds.getParameters());
		return userGames;
	}
}