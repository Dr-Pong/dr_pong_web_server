import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { UserDetailResponseDto } from './dto/user.detail.response.dto';
import { PatchUsersDetailRequestDto } from './dto/patch.users.detail.request.dto';
import { PatchUserDetailDto } from './dto/patch.user.detail.dto';
import { PatchUserTitleDto } from './dto/patch.user.title.dto';
import { GetUserSelectedTitleDto } from './dto/get.user.selected.title.dto';
import { GetUserAchievementsDto } from 'src/user-achievement/dto/get.user.achievements.dto';
import { UserAchievementService } from 'src/user-achievement/user-achievement.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { UserAchievementsDto } from 'src/user-achievement/dto/user.achievements.dto';
import { UsersDetailDto } from './dto/users.detail.dto';
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

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private userAchievementService: UserAchievementService,
    private userEmojiService: UserEmojiService,
    private userTitleService: UserTitleService,
    private authService: AuthService,
    ) {}

  @Get('/:nickname/detail')
  async userDetailByNicknameGet(@Param('nickname') nickname: string) {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const getUsersTitlesDto: GetUserSelectedTitleDto = { nickname };

    const user = await this.userService.getUsersDetail(getUsersDetailDto);
    const title = await this.userService.getUserSelectedTitle(
      getUsersTitlesDto,
    );
    const responseDto: UserDetailResponseDto = {
      nickname: user.nickname,
      imgUrl: user.imgUrl,
      level: user.level,
      statusMessage: user.statusMessage,
      title: title.title,
    };
    return responseDto;
  }

  @Get('/:nickname/achievements')
   async userAchievementByNicknameGet(
    @Param('nickname') nickname: string,
    @Query('selected') selected: boolean,
  ) : Promise<UserAchievementsResponseDto> {
    const authDto : AuthDto = await this.authService.getUserByNickname(nickname);
    const getUserAchievementDto: GetUserAchievementsDto = { userId:authDto.id, isSelected:selected }

    const achievements : UserAchievementsDto = await this.userAchievementService.getUserAchievements(getUserAchievementDto);

    const responseDto: UserAchievementsResponseDto = {
      achievements: achievements,
    }
    return responseDto;
  }

  @Get('/:nickname/emojis')
  async userEmojisByNicknameGet(
   @Param('nickname') nickname: string,
   @Query('selected') selected: boolean,
 ): Promise<UserEmojisResponseDto>{
   const authDto : AuthDto = await this.authService.getUserByNickname(nickname);
   const getUserEmojisDto: GetUserEmojisDto = { userId:authDto.id, isSelected:selected }
 
   const emojis : UseremojisDto = await this.userEmojiService.getUseremojis(getUserEmojisDto);
   const responseDto: UserEmojisResponseDto = {
    emojis: emojis,
  }
   return responseDto;
 }

 @Get('/:nickname/titles')
 async getUsersTitlesByNickname(@Param('nickname') nickname: string): Promise<UserTitlesResponseDto> {
  console.log(nickname);
   const authDto : AuthDto = await this.authService.getUserByNickname(nickname);
   const getUsersTitlesDto: GetUserTitlesDto = { userId: authDto.id };
   const titles : UserTitlesDto = await this.userTitleService.getUserTitles(getUsersTitlesDto);
   const responseDto: UserTitlesResponseDto = {
     titles: titles,
   }
   return responseDto;
 }

 @Patch('/:nickname/detail')
  async usersDetailByNicknamePatch(
    @Param('nickname') nickname: string,
    @Body('body')
    patchRequestDto: PatchUsersDetailRequestDto,
  ) : Promise<void> {
    const patchUserDetailDto: PatchUserDetailDto = {
      nickname,
      imgUrl: patchRequestDto.imgUrl,
      statusMessage: patchRequestDto.message,
    };
    const patchUserTitleDto: PatchUserTitleDto = {
      nickname,
      titleId: patchRequestDto.titleId,
    };
  }

  @Patch('/:nickname/achievements')
  async userAchievementsByNicknamePatch(
    @Param('nickmane') nickname: string,
    @Body('body')
    patchRequestDto: PatchUserAchievementsRequestDto,
  ): Promise <void> {
    const authDto : AuthDto = await this.authService.getUserByNickname(nickname);

    const patchUserAchievementsDto: PatchUserAchievementsDto ={
      userId: authDto.id,
      achievementsId: patchRequestDto.achievements,
    }
  }

  @Patch('/:nickname/emojis')
  async userEmojisByNicknamePatch(
    @Param('nickmane') nickname: string,
    @Body('body')
    patchRequestDto: PatchUserEmojisRequestDto,
  ): Promise <void> {
    const authDto : AuthDto = await this.authService.getUserByNickname(nickname);

    const patchUserAchievementsDto: PatchUserEmojisDto ={
      userId: authDto.id,
      emojisId: patchRequestDto.emojis,
    }
  }

}
