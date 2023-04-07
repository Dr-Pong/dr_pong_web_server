import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUsersDetailDto } from './dto/get.users.detail.dto';
import { GetUsersTitlesDto } from './dto/get.users.titles.dto';
import { UserDetailResponseDto } from './dto/user.detail.response.dto';
import { PatchUsersDetailRequestDto } from './dto/patch.users.detail.request.dto';
import { PatchUsersDetailDto } from './dto/patch.users.detail.dto';
import { PatchUsersTitleDto } from './dto/patch.users.title.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:nickname/detail')
  async getUsersDetailByNickname(@Param('nickname') nickname: string) {
    const getUsersDetailDto: GetUsersDetailDto = { nickname };
    const getUsersTitlesDto: GetUsersTitlesDto = { nickname };

    const user = await this.userService.usersDetailByDtoGet(getUsersDetailDto);
    const title = await this.userService.userSelectedTitleByDtoGet(
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
    const patchUsersDetailDto: PatchUsersDetailDto = {
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
    const getUsersTitlesDto: GetUsersTitlesDto = { nickname };
  }
}
