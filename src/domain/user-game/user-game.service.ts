import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { UserGameRoundDto } from './dto/user-game.round.dto';
import { TouchLogRepository } from '../touch-log/touch.log.repository';
import { GAMEEVENT_TOUCH } from 'src/global/type/type.game.event';
@Injectable()
export class UserGameService {
  private readonly logger: Logger = new Logger(UserGameService.name);
  constructor(
    private readonly userGameRepository: UserGameRepository,
    private readonly seasonRepository: SeasonRepository,
    private readonly touchLogRepository: TouchLogRepository,
  ) {}

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async getUserGameTotalStat(
    getDto: GetUserGameTotalStatDto,
  ): Promise<UserGameTotalStatDto> {
    const totalUserGameRecords: UserGame[] =
      await this.userGameRepository.findAllByUserId(getDto.userId);
    const responseDto: UserGameTotalStatDto =
      UserGameTotalStatDto.fromUserGames(totalUserGameRecords);
    return responseDto;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
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

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
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

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async getUserGameByNicknameAndGameId(
    getDto: GetUserGameByNicknameAndGameIdDto,
  ): Promise<UserGameByNicknameAndGameIdResponseDto> {
    const userGames: UserGame[] =
      await this.userGameRepository.findTwoUserGameByGameId(getDto.gameId);
    if (userGames.length === 0)
      throw new NotFoundException('게임이 존재하지 않습니다.');
    let meUserGame: UserGame = null;
    let youUserGame: UserGame = null;
    if (userGames[0].user.nickname === getDto.nickname) {
      meUserGame = userGames[0];
      youUserGame = userGames[1];
    } else if (userGames[1].user.nickname === getDto.nickname) {
      youUserGame = userGames[0];
      meUserGame = userGames[1];
    } else throw new NotFoundException('유저가 게임에 참여하지 않았습니다.');
    const responseMeDto = new UserGameLpDto(
      meUserGame.lpResult,
      meUserGame.lpChange,
    );
    const responseYouDto = new UserGameLpDto(
      youUserGame.lpResult,
      youUserGame.lpChange,
    );

    const touchLog = await this.touchLogRepository.findAllByUserGameId(
      getDto.gameId,
    );

    const rounds: UserGameRoundDto[] = [];
    let i = 0;
    while (i < touchLog.length) {
      i = 0;
      while (touchLog[i].event === GAMEEVENT_TOUCH) {
        i++;
      }
      rounds.push({
        bounces: i,
        meWin: touchLog[i].userGame.id === meUserGame.user.id,
      });
    }

    const responseDto = new UserGameByNicknameAndGameIdResponseDto(
      meUserGame.game.playTime,
      responseMeDto,
      responseYouDto,
      rounds,
    );
    return responseDto;
  }
}
