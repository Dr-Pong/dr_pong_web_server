import { UserIdCardDto } from 'src/domain/auth/jwt/auth.user.id-card.dto';
import { PatchUserTitleRequestDto } from './patch.user.title.request.dto';

export class PatchUserTitleDto {
  userId: number;
  titleId: number;

  static forPatchUserTitleDto(
    userInfoDto: UserIdCardDto,
    patchRequestDto: PatchUserTitleRequestDto,
  ): PatchUserTitleDto {
    return {
      userId: userInfoDto.id,
      titleId: patchRequestDto.id,
    };
  }
}
