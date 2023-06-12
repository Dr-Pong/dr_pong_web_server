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
import { UserService } from '../user.service';
import { GetUserDetailDto } from '../dto/get.user.detail.dto';
import { PatchUserTitleDto } from '../../user-title/dto/patch.user.title.dto';
import { GetUserAchievementsDto } from 'src/domain/user-achievement/dto/get.user.achievements.dto';
import { UserAchievementService } from 'src/domain/user-achievement/user-achievement.service';
import { UserAchievementsResponseDto } from 'src/domain/user-achievement/dto/user-achievements.response.dto';
import { GetUserEmojisDto } from 'src/domain/user-emoji/dto/get.user.emojis.dto';
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
import { UserInfoDto } from '../dto/user.info.dto';
import { PatchUserImageRequestDto } from '../dto/patch.user.image.request.dto';
import { PatchUserTitleRequestDto } from '../../user-title/dto/patch.user.title.request.dto';
import { PatchUserImageDto } from '../dto/patch.user.image.dto';
import { PatchUserMessageRequestDto } from '../dto/patch.user.message.request.dto';
import { PatchUserMessageDto } from '../dto/patch.user.message.dto';
import { ProfileImagesDto } from 'src/domain/profile-image/dto/profile-image.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserCollectablesController {
  constructor(
    private userService: UserService,
    private userAchievementService: UserAchievementService,
    private userEmojiService: UserEmojiService,
    private userTitleService: UserTitleService,
  ) {}

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

  @Get('/images')
  async usersImagesGet(): Promise<ProfileImagesDto> {
    const profileImages: ProfileImagesDto =
      await this.userService.getUserImages();
    return profileImages;
  }

  @Patch('/:nickname/title')
  @UseGuards(AuthGuard('jwt'))
  async usersDetailByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body()
    patchRequestDto: PatchUserTitleRequestDto,
  ): Promise<void> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const patchUserTitleDto: PatchUserTitleDto =
      PatchUserTitleDto.forPatchUserTitleDto(userInfoDto, patchRequestDto);
    await this.userTitleService.patchUserTitle(patchUserTitleDto);
  }

  /** Patch User Image*/
  @Patch('/:nickname/image')
  @UseGuards(AuthGuard('jwt'))
  async usersImageByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body()
    patchRequestDto: PatchUserImageRequestDto,
  ): Promise<void> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const patchUserImageDto: PatchUserImageDto =
      PatchUserImageDto.forPatchUserImageDto(userInfoDto, patchRequestDto);
    await this.userService.patchUserImage(patchUserImageDto);
  }

  /** Patch User StatusMessage*/
  @Patch('/:nickname/message')
  @UseGuards(AuthGuard('jwt'))
  async usersMessageByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body()
    patchRequestDto: PatchUserMessageRequestDto,
  ): Promise<void> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const patchUserMessageDto: PatchUserMessageDto =
      PatchUserMessageDto.forPatchUserMessageDto(userInfoDto, patchRequestDto);
    await this.userService.patchUserStatusMessage(patchUserMessageDto);
  }

  @Patch('/:nickname/achievements')
  @UseGuards(AuthGuard('jwt'))
  async userAchievementsByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body()
    patchRequestDto: PatchUserAchievementsRequestDto,
  ): Promise<void> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );
    const patchUserAchievementsDto: PatchUserAchievementsDto =
      PatchUserAchievementsDto.forPatchUserAchievementsDto(
        userInfoDto,
        patchRequestDto,
      );

    await this.userAchievementService.patchUserAchievements(
      patchUserAchievementsDto,
    );
  }

  @Patch('/:nickname/emojis')
  @UseGuards(AuthGuard('jwt'))
  async userEmojisByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body()
    patchRequestDto: PatchUserEmojisRequestDto,
  ): Promise<void> {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );

    const patchUserAchievementsDto: PatchUserEmojisDto =
      PatchUserEmojisDto.forPatchUserEmojisDto(userInfoDto, patchRequestDto);

    await this.userEmojiService.patchUseremojis(patchUserAchievementsDto);
  }
}
