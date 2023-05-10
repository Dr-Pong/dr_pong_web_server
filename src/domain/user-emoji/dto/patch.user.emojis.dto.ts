import { UserInfoDto } from 'src/domain/user/dto/user.info.dto';
import { PatchUserEmojisRequestDto } from './patch.user.emojis.request.dto';

export class PatchUserEmojisDto {
  userId: number;
  emojisId: (number | null)[];

  static forPatchUserEmojisDto(
    userInfoDto: UserInfoDto,
    patchRequestDto: PatchUserEmojisRequestDto,
  ): PatchUserEmojisDto {
    return {
      userId: userInfoDto.id,
      emojisId: patchRequestDto.ids,
    };
  }
}
