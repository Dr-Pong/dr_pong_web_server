import { UserIdCardDto } from 'src/domain/auth/jwt/auth.user.id-card.dto';
import { PatchUserMessageRequestDto } from './patch.user.message.request.dto';

export class PatchUserMessageDto {
  userId: number;
  message: string;

  static forPatchUserMessageDto(
    userInfoDto: UserIdCardDto,
    patchRequestDto: PatchUserMessageRequestDto,
  ): PatchUserMessageDto {
    return {
      userId: userInfoDto.id,
      message: patchRequestDto.message,
    };
  }
}
