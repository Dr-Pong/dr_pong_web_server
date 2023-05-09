import { GameResultType } from "src/global/type/type.game.result";
import { GamePlayerDto } from "./game.player.dto";
import { GameType } from "src/global/type/type.game";

export class UserGameRecordDto {
	gameId: number;
	gameType: GameType;
	playedAt: string;
	me: GamePlayerDto
	you: GamePlayerDto
	result: GameResultType;
}

export class UserGameRecordsDto {
	records: UserGameRecordDto[];
	isLastPage: boolean;
}