import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../user.service';
import { GetUserDetailDto } from '../dto/get.user.detail.dto';

import { UserInfoDto } from '../dto/user.info.dto';
import { UserTotalRankResponseDto } from 'src/domain/rank/dto/user.total.rank.response.dto';
import { RankService } from 'src/domain/rank/rank.service';
import { RankBestStatDto } from 'src/domain/rank/dto/rank.best.stat.dto';
import { GetUserBestRankStatDto } from 'src/domain/rank/dto/get.user.best.rank.stat.dto';
import { UserSeasonRankResponseDto } from 'src/domain/rank/dto/user.season.rank.response.dto';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private rankService: RankService,
  ) {}

  //** Get stat's best rank*/
  @Get('/:nickname/ranks/total')
  async userTotalRankByNicknameGet(
    @Param('nickname') nickname: string,
  ): Promise<UserTotalRankResponseDto> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const getUserTotalRankDto: GetUserBestRankStatDto = {
      userId: userInfoDto.id,
    };
    const userTotalRank: RankBestStatDto =
      await this.rankService.getUserBestRank(getUserTotalRankDto);
    const responseDto: UserTotalRankResponseDto =
      UserTotalRankResponseDto.forUserTotalRankResponse(userTotalRank);
    return responseDto;
  }

  //** Get stat's season rank*/
  @Get('/:nickname/ranks/season')
  async userSeasonRankByNicknameGet(
    @Param('nickname') nickname: string,
  ): Promise<UserSeasonRankResponseDto> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const getUserSeasonRankDto: GetUserBestRankStatDto = {
      userId: userInfoDto.id,
    };
    const userSeasonRank: RankBestStatDto =
      await this.rankService.getUserBestRank(getUserSeasonRankDto);
    const responseDto: UserSeasonRankResponseDto =
      UserSeasonRankResponseDto.forUserSeasonRankResponse(userSeasonRank);
    return responseDto;
  }
}
