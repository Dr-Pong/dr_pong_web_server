import { PatchUserMessageRequestDto } from './patch.user.message.request.dto';
import { UserInfoDto } from './user.info.dto';

export class PatchUserMessageDto {
  userId: number;
  message: string;

  static forPatchUserMessageDto(
    userInfoDto: UserInfoDto,
    patchRequestDto: PatchUserMessageRequestDto,
  ): PatchUserMessageDto {
    return {
      userId: userInfoDto.id,
      message: patchRequestDto.message,
    };
  }
}
