import { PatchUserAchievementsRequestDto } from './patch.user.achievements.request.dto';
import { UserIdCardDto } from 'src/domain/auth/jwt/auth.user.id-card.dto';

export class PatchUserAchievementsDto {
  userId: number;
  achievementsId: (number | null)[];

  static forPatchUserAchievementsDto(
    userInfoDto: UserIdCardDto,
    patchRequestDto: PatchUserAchievementsRequestDto,
  ): PatchUserAchievementsDto {
    return {
      userId: userInfoDto.id,
      achievementsId: patchRequestDto.ids,
    };
  }
}
