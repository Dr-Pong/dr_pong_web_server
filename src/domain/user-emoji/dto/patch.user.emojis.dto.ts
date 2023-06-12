import { PatchUserEmojisRequestDto } from './patch.user.emojis.request.dto';
import { UserIdCardDto } from 'src/domain/auth/jwt/auth.user.id-card.dto';

export class PatchUserEmojisDto {
  userId: number;
  emojisId: (number | null)[];

  static forPatchUserEmojisDto(
    userInfoDto: UserIdCardDto,
    patchRequestDto: PatchUserEmojisRequestDto,
  ): PatchUserEmojisDto {
    return {
      userId: userInfoDto.id,
      emojisId: patchRequestDto.ids,
    };
  }
}
