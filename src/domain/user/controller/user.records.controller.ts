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

  // @Get('/:nickname/records/:gameId')
  // async userGameRecordDetail(
  //   @Param('nickname') nickname: string,
  //   @Param('gameId', ParseIntPipe) count: number,
  // ) {
  //   return {
  //     duration: 214,
  //     me: {
  //       lp: 4242,
  //       lpChange: 42,
  //     },
  //     you: {
  //       lp: 4158,
  //       lpChange: -42,
  //     },
  //     rounds: [
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: false,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: false,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: false,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: false,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: false,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: false,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: false,
  //       },
  //       {
  //         bounces: randomInt(1, 42),
  //         meWin: true,
  //       },
  //     ],
  //   };
  // }
}
