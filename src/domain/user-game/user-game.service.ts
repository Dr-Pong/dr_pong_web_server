import { Injectable, Logger } from '@nestjs/common';
import { GetUserGameRecordsDto } from './dto/get.user-game.records.dto';
import { UserGameRecordDto } from './dto/user-game.records.dto';
import { UserGameRecordsDto } from './dto/user-game.records.dto';
import { UserGame } from './user-game.entity';
import { UserGameRepository } from './user-game.repository';
import { GetUserGameTotalStatDto } from './dto/get.user-game.total.stat.dto';
import { SeasonRepository } from 'src/domain/season/season.repository';
import { Season } from 'src/domain/season/season.entity';
import { GetUserGameSeasonStatDto } from './dto/get.user-game.season.stat.dto';
import { UserGameTotalStatDto } from './dto/user-game.total.stat.dto';
import { UserGameSeasonStatDto } from './dto/user-game.season.stat.dto';
import { UserGameByNicknameAndGameIdResponseDto } from './dto/get.user-game.game.response.dto';
import { GetUserGameByNicknameAndGameIdDto } from './dto/get.user-game.by.nickname.and.gameid.dto';
import { UserGameLpDto } from './dto/user-game.lp.dto';
@Injectable()
export class UserGameService {
  private readonly logger: Logger = new Logger(UserGameService.name);
  constructor(
    private readonly userGameRepository: UserGameRepository,
    private readonly seasonRepository: SeasonRepository,
  ) {}

  async getUserGameTotalStat(
    getDto: GetUserGameTotalStatDto,
  ): Promise<UserGameTotalStatDto> {
    const totalUserGameRecords: UserGame[] =
      await this.userGameRepository.findAllByUserId(getDto.userId);
    const responseDto: UserGameTotalStatDto =
      UserGameTotalStatDto.fromUserGames(totalUserGameRecords);
    return responseDto;
  }

  async getUserGameSeasonStat(
    getDto: GetUserGameSeasonStatDto,
  ): Promise<UserGameSeasonStatDto> {
    const currentSeason: Season =
      await this.seasonRepository.findCurrentSeason();

    const totalUserGameRecords: UserGame[] =
      await this.userGameRepository.findAllByUserIdAndSeasonId({
        userId: getDto.userId,
        seasonId: currentSeason.id,
      });

    const responseDto: UserGameTotalStatDto =
      UserGameTotalStatDto.fromUserGames(totalUserGameRecords);
    return responseDto;
  }

  async getUserGameRecordsByCountAndLastGameId(
    getDto: GetUserGameRecordsDto,
  ): Promise<UserGameRecordsDto> {
    const userGames: UserGame[] =
      await this.userGameRepository.findAllByUserIdAndGameIdLowerThanLastGameId(
        getDto,
      );
    const isLastPage: boolean = userGames.length / 2 < getDto.count + 1;
    const records: UserGameRecordDto[] = UserGameRecordDto.fromUserGames(
      getDto.userId,
      userGames,
    );

    if (!isLastPage) {
      records.pop();
    }

    const responseDto: UserGameRecordsDto = {
      records,
      isLastPage,
    };

    return responseDto;
  }

  async getUserGameByNicknameAndGameId(
    getDto: GetUserGameByNicknameAndGameIdDto,
  ): Promise<UserGameByNicknameAndGameIdResponseDto> {
    const userGames = await this.userGameRepository.findTwoByUserGameByGameId(
      getDto.gameId,
    );
    let meUserGame: UserGame = null;
    let youUserGame: UserGame = null;
    if (userGames[0].user.nickname === getDto.nickname) {
      meUserGame = userGames[0];
      youUserGame = userGames[1];
    } else {
      youUserGame = userGames[0];
      meUserGame = userGames[1];
    }
    const responseMeDto = new UserGameLpDto(
      meUserGame.lpResult,
      meUserGame.lpChange,
    );
    const responseYouDto = new UserGameLpDto(
      youUserGame.lpResult,
      youUserGame.lpChange,
    );
    const responseDto = new UserGameByNicknameAndGameIdResponseDto(
      meUserGame.game.playTime,
      responseMeDto,
      responseYouDto,
      null,
    );
    return responseDto;
  }
}
