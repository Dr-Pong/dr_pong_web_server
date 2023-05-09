import { GameResultType } from "src/global/type/type.game.result";
import { GamePlayerDto } from "./game.player.dto";
import { GameType } from "src/global/type/type.game";
import { User } from "src/user/user.entity";
import { UserGame } from "../user-game.entity";

export class UserGameRecordDto {
	gameId: number;
	gameType: GameType;
	playedAt: string;
	me: GamePlayerDto
	you: GamePlayerDto
	result: GameResultType;

	static fromUserGames(userId: number, userGames: UserGame[]): UserGameRecordDto[] {
		const records: UserGameRecordDto[] = [];

		for (let i = 0; i < userGames.length / 2; i++) {
			let me: GamePlayerDto;
			let you: GamePlayerDto;

			if (userGames[i * 2].user.id === userId) {
				me = GamePlayerDto.formUserGame(userGames[i * 2]);
				you = GamePlayerDto.formUserGame(userGames[i * 2 + 1]);
			} else {
				me = GamePlayerDto.formUserGame(userGames[i * 2 + 1]);
				you = GamePlayerDto.formUserGame(userGames[i * 2]);
			}

			records.push({
				gameId: userGames[i].game.id,
				gameType: userGames[i].game.type,
				playedAt: userGames[i].game.startTime.toString(),
				me: me,
				you: you,
				result: userGames[i].result,
			});
		}
		return records;
	}
}

export class UserGameRecordsDto {
	records: UserGameRecordDto[];
	isLastPage: boolean;

}