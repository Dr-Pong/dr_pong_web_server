import { UserInfoDto } from 'src/domain/user/dto/user.info.dto';
import { PatchUserTitleRequestDto } from './patch.user.title.request.dto';

export class PatchUserTitleDto {
  userId: number;
  titleId: number;

  static forPatchUserTitleDto(
    userInfoDto: UserInfoDto,
    patchRequestDto: PatchUserTitleRequestDto,
  ): PatchUserTitleDto {
    return {
      userId: userInfoDto.id,
      titleId: patchRequestDto.id,
    };
  }
}
