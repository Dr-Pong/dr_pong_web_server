import { UserTitleSelectedDto } from 'src/domain/user-title/dto/user.title.selected.dto';
import { UserDetailDto } from './user.detail.dto';
import { ProfileImageDto } from 'src/domain/profile-image/dto/profile-image.dto';

export class UserDetailResponseDto {
  nickname: string;
  image: ProfileImageDto;
  level: number;
  title: UserTitleSelectedDto;
  statusMessage: string;

  static forUserDetailResponse(
    user: UserDetailDto,
    title: UserTitleSelectedDto,
  ): UserDetailResponseDto {
    return {
      nickname: user.nickname,
      image: { id: user.image.id, url: user.image.url },
      level: user.level,
      statusMessage: user.statusMessage,
      title: title,
    };
  }
}
