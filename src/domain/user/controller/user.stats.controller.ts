import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../user.service';
import { GetUserDetailDto } from '../dto/get.user.detail.dto';
import { UserGameTotalStatResponseDto } from '../../user-game/dto/user-game.total.stat.response.dto';
import { GetUserGameTotalStatDto } from '../../user-game/dto/get.user-game.total.stat.dto';
import { UserGameService } from '../../user-game/user-game.service';
import { UserGameTotalStatDto } from '../../user-game/dto/user-game.total.stat.dto';
import { UserGameSeasonStatResponseDto } from '../../user-game/dto/user-game.season.stat.response.dto';
import { GetUserGameSeasonStatDto } from '../../user-game/dto/get.user-game.season.stat.dto';
import { UserGameSeasonStatDto } from '../../user-game/dto/user-game.season.stat.dto';
import { UserInfoDto } from '../dto/user.info.dto';

@Controller('users')
export class UserStatsController {
  constructor(
    private userService: UserService,
    private userGameService: UserGameService,
  ) {}

  //** Get stat's total*/
  @Get('/:nickname/stats/total')
  async userTotalStatByNicknameGet(
    @Param('nickname') nickname: string,
  ): Promise<UserGameTotalStatResponseDto> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const getUserTotalStatDto: GetUserGameTotalStatDto = {
      userId: userInfoDto.id,
    };

    const userTotalStat: UserGameTotalStatDto =
      await this.userGameService.getUserGameTotalStat(getUserTotalStatDto);
    const responseDto: UserGameTotalStatResponseDto =
      await UserGameTotalStatResponseDto.forUserGameTotalStatResponse(
        userTotalStat,
      );
    return responseDto;
  }

  //** Get stat's season*/
  @Get('/:nickname/stats/season')
  async userSeasonStatByNicknameGet(
    @Param('nickname') nickname: string,
  ): Promise<UserGameSeasonStatResponseDto> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const getUserSeasonStatDto: GetUserGameSeasonStatDto = {
      userId: userInfoDto.id,
    };
    const userSeasonStat: UserGameSeasonStatDto =
      await this.userGameService.getUserGameSeasonStat(getUserSeasonStatDto);
    const responseDto: UserGameSeasonStatResponseDto =
      UserGameSeasonStatResponseDto.forUserGameSeasonStatResponse(
        userSeasonStat,
      );

    return responseDto;
  }
}
