import {
  Body,
  Controller,
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
import { PatchUsersDetailRequestDto } from './dto/patch.users.detail.request.dto';
import { PatchUserDetailDto } from './dto/patch.user.detail.dto';
import { PatchUserTitleDto } from '../user-title/dto/patch.user.title.dto';
import { GetUserSelectedTitleDto } from './dto/get.user.selected.title.dto';
import { GetUserAchievementsDto } from 'src/user-achievement/dto/get.user.achievements.dto';
import { UserAchievementService } from 'src/user-achievement/user-achievement.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { UserAchievementsDto } from 'src/user-achievement/dto/user.achievements.dto';
import { UserDetailDto } from './dto/user.detail.dto';
import { UserAchievementsResponseDto } from 'src/user-achievement/dto/user-achievements.response.dto';
import { GetUserEmojisDto } from 'src/user-emoji/dto/get.user.emojis.dto';
import { UseremojisDto } from 'src/user-emoji/dto/user.emojis.dto';
import { UserEmojiService } from 'src/user-emoji/user-emoji.service';
import { UserTitleService } from 'src/user-title/user-title.service';
import { UserEmojisResponseDto } from 'src/user-emoji/dto/user.emojis.response.dto';
import { UserTitlesResponseDto } from 'src/user-title/dto/user.titles.response.dto';
import { PatchUserAchievementsDto } from 'src/user-achievement/dto/patch.user.achievements.dto';
import { PatchUserAchievementsRequestDto } from 'src/user-achievement/dto/patch.user.achievements.request.dto';
import { PatchUserEmojisDto } from 'src/user-emoji/dto/patch.user.emojis.dto';
import { PatchUserEmojisRequestDto } from 'src/user-emoji/dto/patch.user.emojis.request.dto';
import { UserTitlesDto } from 'src/user-title/dto/user.titles.dto';
import { GetUserTitlesDto } from 'src/user-title/dto/get.user.titles.dto';
import { UserInfoDto } from './dto/user.info.dto';
import { AuthGuard } from '@nestjs/passport';
import { userInfo } from 'os';
import { UserTitleSelectedDto } from 'src/user-title/dto/user.title.selected.dto';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userAchievementService: UserAchievementService,
    private userEmojiService: UserEmojiService,
    private userTitleService: UserTitleService,
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
    @Query('selected', ParseBoolPipe) selected: boolean,
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
    @Query('selected') selected: boolean,
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
  async getUsersTitlesByNickname(
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

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:nickname/detail')
  async usersDetailByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body()
    patchRequestDto: PatchUsersDetailRequestDto,
  ): Promise<void> {
    // console.log('patchDto', patchRequestDto);
    const patchUserDetailDto: PatchUserDetailDto = {
      nickname,
      imgUrl: patchRequestDto.imgUrl,
      statusMessage: patchRequestDto.message,
    };
    const patchUserTitleDto: PatchUserTitleDto = {
      nickname,
      titleId: patchRequestDto.titleId,
    };
    await this.userService.patchUserDetail(patchUserDetailDto);
    await this.userTitleService.patchUserTitle(patchUserTitleDto);
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
      achievementsId: patchRequestDto.achievements,
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
      emojisId: patchRequestDto.emojis,
    };

    await this.userEmojiService.patchUseremojis(patchUserAchievementsDto);
  }
}
