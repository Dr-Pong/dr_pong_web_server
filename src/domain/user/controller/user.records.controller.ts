import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserService } from '../user.service';
import { GetUserDetailDto } from '../dto/get.user.detail.dto';
import { UserInfoDto } from '../dto/user.info.dto';
import { UserGameService } from '../../user-game/user-game.service';
import { UserGameRecordsResponseDto } from '../../user-game/dto/user-game.record.response.dto';
import { GetUserGameRecordsDto } from '../../user-game/dto/get.user-game.records.dto';
import { UserGameRecordsDto } from '../../user-game/dto/user-game.records.dto';
import { GetUserGameByNicknameAndGameIdDto } from 'src/domain/user-game/dto/get.user-game.by.nickname.and.gameid.dto';
import { UserGameByNicknameAndGameIdResponseDto } from 'src/domain/user-game/dto/get.user-game.game.response.dto';
import { GetUserGameExpDto } from 'src/domain/user-game/dto/get.user-game.exp.dto';
import { GetUserGameExpResponseDto } from 'src/domain/user-game/dto/get.user-game.exp.response.dto';

@Controller('users')
export class UserRecordsController {
  constructor(
    private userService: UserService,
    private userGameService: UserGameService,
  ) {}

  @Get('/:nickname/records')
  async userGameRecordsByNicknameGet(
    @Param('nickname') nickname: string,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
    @Query('lastGameId', new DefaultValuePipe(0), ParseIntPipe)
    lastGameId: number,
  ): Promise<UserGameRecordsResponseDto> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const getUserGameRecordsDto: GetUserGameRecordsDto = {
      userId: userInfoDto.id,
      count,
      lastGameId: lastGameId || 2147483647,
    };
    const userGameRecords: UserGameRecordsDto =
      await this.userGameService.getUserGameRecordsByCountAndLastGameId(
        getUserGameRecordsDto,
      );
    const responseDto: UserGameRecordsResponseDto = {
      records: userGameRecords.records,
      isLastPage: userGameRecords.isLastPage,
    };

    return responseDto;
  }

  @Get('/:nickname/records/:gameId')
  async userGameRecordDetail(
    @Param('nickname') nickname: string,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    const inputDto: GetUserGameByNicknameAndGameIdDto =
      new GetUserGameByNicknameAndGameIdDto(nickname, gameId);
    const response = await this.userGameService.getUserGameByNicknameAndGameId(
      inputDto,
    );
    const responseDto: UserGameByNicknameAndGameIdResponseDto =
      new UserGameByNicknameAndGameIdResponseDto(
        response.duration,
        response.me,
        response.you,
        response.rounds,
      );
    return responseDto;
  }

  @Get('/:nickname/records/:gameId/exp')
  async userGameExp(
    @Param('nickname') nickname: string,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    const inputDto: GetUserGameExpDto = new GetUserGameExpDto(nickname, gameId);
    const response =
      await this.userGameService.getUserGameExpByNicknameAndGameId(inputDto);

    const responseDto: GetUserGameExpResponseDto =
      new GetUserGameExpResponseDto(
        response.beforeExp,
        response.expChange,
        response.levelExp,
      );
    return responseDto;
  }
}
