import { Injectable } from '@nestjs/common';
import { GetUserGameRecordsDto } from './dto/get.user-game.records.dto';
import { UserGameRecordDto } from './dto/user-game.records.dto';
import { UserGameRecordsDto } from './dto/user-game.records.dto';
import { GamePlayerDto } from './dto/game.player.dto';
import { UserGame } from './user-game.entity';
import { UserGameRepository } from './user-game.repository';
import { GetUserGameTotalStatDto } from './dto/get.user-game.total.stat.dto';
import { SeasonRepository } from 'src/domain/season/season.repository';
import { Season } from 'src/domain/season/season.entity';
import { GetUserGameSeasonStatDto } from './dto/get.user-game.season.stat.dto';
import { UserGameTotalStatDto } from './dto/user-game.total.stat.dto';

@Injectable()
export class UserGameService {
	constructor(
		private readonly userGameRepository: UserGameRepository,
		private readonly seasonRepository: SeasonRepository,
	) { }

	async getUserGameTotalStat(getDto: GetUserGameTotalStatDto): Promise<UserGameTotalStatDto> {
		const totalUserGameRecords: UserGame[] = await this.userGameRepository.findAllByUserId(getDto.userId);
		const responseDto: UserGameTotalStatDto = UserGameTotalStatDto.fromUserGames(totalUserGameRecords);
		return responseDto;
	}

	async getUserGameSeasonStat(getDto: GetUserGameSeasonStatDto): Promise<UserGameTotalStatDto> {
		const currentSeason: Season = await this.seasonRepository.findCurrentSeason();

		const totalUserGameRecords: UserGame[] = await this.userGameRepository
			.findAllByUserIdAndSeasonId({
				userId: getDto.userId,
				seasonId: currentSeason.id
			});

		const responseDto: UserGameTotalStatDto = UserGameTotalStatDto.fromUserGames(totalUserGameRecords);
		return responseDto;
	}

	async getUserGameRecordsByCountAndLastGameId(getDto: GetUserGameRecordsDto): Promise<UserGameRecordsDto> {
		const userGames: UserGame[] = await this.userGameRepository.findAllByUserIdAndGameIdLowerThanLastGameId(getDto);
		const isLastPage: boolean = userGames.length / 2 < getDto.count + 1;
		const records: UserGameRecordDto[] = UserGameRecordDto.fromUserGames(getDto.userId, userGames);

		if (!isLastPage) {
			records.pop();
		}

		const responseDto: UserGameRecordsDto = {
			records,
			isLastPage,
		}

		return responseDto;
	}
}
