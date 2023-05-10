import { UserInfoDto } from 'src/domain/user/dto/user.info.dto';
import { PatchUserAchievementsRequestDto } from './patch.user.achievements.request.dto';

export class PatchUserAchievementsDto {
  userId: number;
  achievementsId: (number | null)[];

  static forPatchUserAchievementsDto(
    userInfoDto: UserInfoDto,
    patchRequestDto: PatchUserAchievementsRequestDto,
  ): PatchUserAchievementsDto {
    return {
      userId: userInfoDto.id,
      achievementsId: patchRequestDto.ids,
    };
  }
}
