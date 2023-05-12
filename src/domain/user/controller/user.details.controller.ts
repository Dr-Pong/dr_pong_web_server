import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../user.service';
import { GetUserDetailDto } from '../dto/get.user.detail.dto';
import { UserDetailResponseDto } from '../dto/user.detail.response.dto';
import { UserDetailDto } from '../dto/user.detail.dto';
import { UserTitleService } from 'src/domain/user-title/user-title.service';
import { GetUserTitlesDto } from 'src/domain/user-title/dto/get.user.titles.dto';
import { UserInfoDto } from '../dto/user.info.dto';
import { UserTitleSelectedDto } from 'src/domain/user-title/dto/user.title.selected.dto';

@Controller('users')
export class UserDetailsController {
  constructor(
    private userService: UserService,
    private userTitleService: UserTitleService,
  ) {}

  @Get('/:nickname/detail')
  async userDetailByNicknameGet(@Param('nickname') nickname: string) {
    const getUsersDetailDto: GetUserDetailDto = { nickname };
    const userInfoDto: UserInfoDto = await this.userService.getUserInfo(
      getUsersDetailDto,
    );

    const getUserTitleDto: GetUserTitlesDto = { userId: userInfoDto.id };

    const user: UserDetailDto = await this.userService.getUsersDetail(
      getUsersDetailDto,
    );

    const title: UserTitleSelectedDto =
      await this.userTitleService.getUserTitleSelected(getUserTitleDto);

    const responseDto: UserDetailResponseDto =
      UserDetailResponseDto.forUserDetailResponse(user, title);
    return responseDto;
  }
}
