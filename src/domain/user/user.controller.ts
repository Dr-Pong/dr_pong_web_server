import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { UserDetailResponseDto } from './dto/user.detail.response.dto';
import { PatchUserTitleDto } from '../user-title/dto/patch.user.title.dto';
import { GetUserSelectedTitleDto } from './dto/get.user.selected.title.dto';
import { GetUserAchievementsDto } from 'src/domain/user-achievement/dto/get.user.achievements.dto';
import { UserAchievementService } from 'src/domain/user-achievement/user-achievement.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { UserAchievementsDto } from 'src/domain/user-achievement/dto/user.achievements.dto';
import { UserDetailDto } from './dto/user.detail.dto';
import { UserAchievementsResponseDto } from 'src/domain/user-achievement/dto/user-achievements.response.dto';
import { GetUserEmojisDto } from 'src/domain/user-emoji/dto/get.user.emojis.dto';
import { UseremojisDto } from 'src/domain/user-emoji/dto/user.emojis.dto';
import { UserEmojiService } from 'src/domain/user-emoji/user-emoji.service';
import { UserTitleService } from 'src/domain/user-title/user-title.service';
import { UserEmojisResponseDto } from 'src/domain/user-emoji/dto/user.emojis.response.dto';
import { UserTitlesResponseDto } from 'src/domain/user-title/dto/user.titles.response.dto';
import { PatchUserAchievementsDto } from 'src/domain/user-achievement/dto/patch.user.achievements.dto';
import { PatchUserAchievementsRequestDto } from 'src/domain/user-achievement/dto/patch.user.achievements.request.dto';
import { PatchUserEmojisDto } from 'src/domain/user-emoji/dto/patch.user.emojis.dto';
import { PatchUserEmojisRequestDto } from 'src/domain/user-emoji/dto/patch.user.emojis.request.dto';
import { UserTitlesDto } from 'src/domain/user-title/dto/user.titles.dto';
import { GetUserTitlesDto } from 'src/domain/user-title/dto/get.user.titles.dto';
import { UserInfoDto } from './dto/user.info.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserTitleSelectedDto } from 'src/domain/user-title/dto/user.title.selected.dto';
import { PatchUserImageRequestDto } from './dto/patch.user.image.request.dto';
import { PatchUserTitleRequestDto } from '../user-title/dto/patch.user.title.request.dto';
import { PatchUserImageDto } from './dto/patch.user.image.dto';
import { PatchUserMessageRequestDto } from './dto/patch.user.message.request.dto';
import { PatchUserMessageDto } from './dto/patch.user.message.dto';
import { UserTotalRankResponseDto } from 'src/domain/rank/dto/user.total.rank.response.dto';
import { RankService } from 'src/domain/rank/rank.service';
import { RankBestStatDto } from 'src/domain/rank/dto/rank.best.stat.dto';
import { GetUserBestRankStatDto } from 'src/domain/rank/dto/get.user.best.rank.stat.dto';
import { UserSeasonRankResponseDto } from 'src/domain/rank/dto/user.season.rank.response.dto';
import { UserGameTotalStatResponseDto } from '../user-game/dto/user-game.total.stat.response.dto';
import { GetUserGameTotalStatDto } from '../user-game/dto/get.user-game.total.stat.dto';
import { UserGameService } from '../user-game/user-game.service';
import { UserGameTotalStatDto } from '../user-game/dto/user-game.total.stat.dto';
import { UserGameSeasonStatResponseDto } from '../user-game/dto/user-game.season.stat.response.dto';
import { GetUserGameSeasonStatDto } from '../user-game/dto/get.user-game.season.stat.dto';
import { UserGameSeasonStatDto } from '../user-game/dto/user-game.season.stat.dto';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userAchievementService: UserAchievementService,
    private userEmojiService: UserEmojiService,
    private userTitleService: UserTitleService,
    private rankService: RankService,
    private userGameService: UserGameService,
  ) {}

  @Get('/:nickname/detail')
  async userDetailByNicknameGet(@Param('nickname') nickname: string) {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    // console.log(userInfoDto);
    const getUserTitleDto: GetUserTitlesDto = { userId: userInfoDto.id };

    const user = await this.userService.getUsersDetail(getUsersDetailDto);
    // console.log(user);
    const title: UserTitleSelectedDto =
      await this.userTitleService.getUserTitleSelected(getUserTitleDto);
    // console.log(user);

    const responseDto: UserDetailResponseDto = {
      nickname: user.nickname,
      imgUrl: user.imgUrl,
      level: user.level,
      statusMessage: user.statusMessage,
      title: title,
    };
    return responseDto;
  }

  @Get('/:nickname/achievements')
  async userAchievementByNicknameGet(
    @Param('nickname') nickname: string,
    @Query('selected', new DefaultValuePipe(false), ParseBoolPipe)
    selected: boolean,
  ): Promise<UserAchievementsResponseDto> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const user = await this.userService.getUserInfo(userInfoDto);
    const getUserAchievementDto: GetUserAchievementsDto = {
      userId: user.id,
    };
    const achievements = selected
      ? await this.userAchievementService.getUserAchievementsSelected(
          getUserAchievementDto,
        )
      : await this.userAchievementService.getUserAchievementsAll(
          getUserAchievementDto,
        );
    const responseDto: UserAchievementsResponseDto = {
      achievements: achievements.achievements,
    };
    return responseDto;
  }

  @Get('/:nickname/emojis')
  async userEmojisByNicknameGet(
    @Param('nickname') nickname: string,
    @Query('selected', new DefaultValuePipe(false), ParseBoolPipe)
    selected: boolean,
  ): Promise<UserEmojisResponseDto> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const user = await this.userService.getUserInfo(userInfoDto);

    const getUserEmojisDto: GetUserEmojisDto = {
      userId: user.id,
    };

    const emojis = selected
      ? await this.userEmojiService.getUseremojisSelected(getUserEmojisDto)
      : await this.userEmojiService.getUseremojisAll(getUserEmojisDto);

    const responseDto: UserEmojisResponseDto = {
      emojis: emojis.emojis,
    };
    return responseDto;
  }

  @Get('/:nickname/titles')
  async usersTitlesByNicknameGet(
    @Param('nickname') nickname: string,
  ): Promise<UserTitlesResponseDto> {
    // console.log(nickname);
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const getUsersTitlesDto: GetUserTitlesDto = { userId: userInfoDto.id };
    const titles: UserTitlesDto = await this.userTitleService.getUserTitles(
      getUsersTitlesDto,
    );
    const responseDto: UserTitlesResponseDto = {
      titles: titles.titles,
    };
    return responseDto;
  }

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
    const responseDto: UserTotalRankResponseDto = {
      record: userTotalRank.record,
      rank: userTotalRank.rank,
      tier: userTotalRank.tier,
    };
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
    const responseDto: UserSeasonRankResponseDto = {
      record: userSeasonRank.record,
      rank: userSeasonRank.rank,
      tier: userSeasonRank.tier,
    };
    return responseDto;
  }

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
    const responseDto: UserGameTotalStatResponseDto = {
      winRate: userTotalStat.winRate,
      wins: userTotalStat.wins,
      ties: userTotalStat.ties,
      loses: userTotalStat.loses,
    };
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
    const responseDto: UserGameSeasonStatResponseDto = {
      winRate: userSeasonStat.winRate,
      wins: userSeasonStat.wins,
      ties: userSeasonStat.ties,
      loses: userSeasonStat.loses,
    };
    return responseDto;
  }

  /** Patch Users title*/
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:nickname/title')
  async usersDetailByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body()
    patchRequestDto: PatchUserTitleRequestDto,
  ): Promise<void> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const patchUserTitleDto: PatchUserTitleDto = {
      userId: userInfoDto.id,
      titleId: patchRequestDto.id,
    };
    await this.userTitleService.patchUserTitle(patchUserTitleDto);
  }

  /** Patch User Image*/
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:nickname/image')
  async usersImageByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body()
    patchRequestDto: PatchUserImageRequestDto,
  ): Promise<void> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const patchUserImageDto: PatchUserImageDto = {
      userId: userInfoDto.id,
      imageId: patchRequestDto.id,
    };
    await this.userService.patchUserImage(patchUserImageDto);
  }

  /** Patch User StatusMessage*/
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:nickname/message')
  async usersMessageByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body()
    patchRequestDto: PatchUserMessageRequestDto,
  ): Promise<void> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const patchUserMessageDto: PatchUserMessageDto = {
      userId: userInfoDto.id,
      message: patchRequestDto.message,
    };
    await this.userService.patchUserStatusMessage(patchUserMessageDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:nickname/achievements')
  async userAchievementsByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body()
    patchRequestDto: PatchUserAchievementsRequestDto,
  ): Promise<void> {
    // console.log('patchDto', patchRequestDto);
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const patchUserAchievementsDto: PatchUserAchievementsDto = {
      userId: userInfoDto.id,
      achievementsId: patchRequestDto.ids,
    };
    await this.userAchievementService.patchUserAchievements(
      patchUserAchievementsDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:nickname/emojis')
  async userEmojisByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body()
    patchRequestDto: PatchUserEmojisRequestDto,
  ): Promise<void> {
    // console.log('patchDto', patchRequestDto);
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );

    const patchUserAchievementsDto: PatchUserEmojisDto = {
      userId: userInfoDto.id,
      emojisId: patchRequestDto.ids,
    };

    await this.userEmojiService.patchUseremojis(patchUserAchievementsDto);
  }
}
