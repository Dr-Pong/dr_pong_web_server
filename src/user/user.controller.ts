import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { UserDetailResponseDto } from './dto/user.detail.response.dto';
import { PatchUsersDetailRequestDto } from './dto/patch.users.detail.request.dto';
import { PatchUserDetailDto } from './dto/patch.user.detail.dto';
import { PatchUsersTitleDto } from './dto/patch.users.title.dto';
import { GetUserSelectedTitleDto } from './dto/get.user.selected.title.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:nickname/detail')
  async UsersDetailByNicknameGet(@Param('nickname') nickname: string) {
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

  @Patch('/:nickname/detail')
  async patchUsersDetailByNickname(
    @Param('nickname') nickname: string,
    @Body('body')
    patchRequestDto: PatchUsersDetailRequestDto,
  ) {
    const patchUsersDetailDto: PatchUserDetailDto = {
      nickname,
      imgUrl: patchRequestDto.imgUrl,
      message: patchRequestDto.message,
    };
    const patchUsersTitleDto: PatchUsersTitleDto = {
      nickname,
      titleId: patchRequestDto.titleId,
    };
  }

  @Get('/:nickname/titles')
  async getUsersTitlesByNickname(@Param('nickname') nickname: string) {
    const getUsersTitlesDto: GetUserSelectedTitleDto = { nickname };
  }
}
