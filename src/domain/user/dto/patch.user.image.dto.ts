import { PatchUserImageRequestDto } from './patch.user.image.request.dto';
import { UserInfoDto } from './user.info.dto';

export class PatchUserImageDto {
  userId: number;
  imageId: number;

  static forPatchUserImageDto(
    userInfoDto: UserInfoDto,
    patchRequestDto: PatchUserImageRequestDto,
  ): PatchUserImageDto {
    return {
      userId: userInfoDto.id,
      imageId: patchRequestDto.id,
    };
  }
}
