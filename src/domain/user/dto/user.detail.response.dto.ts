import { UserTitleSelectedDto } from 'src/domain/user-title/dto/user.title.selected.dto';
import { UserDetailDto } from './user.detail.dto';

export class UserDetailResponseDto {
  nickname: string;
  imgUrl: string;
  level: number;
  title: UserTitleSelectedDto;
  statusMessage: string;

  static forUserDetailResponse(
    user: UserDetailDto,
    title: UserTitleSelectedDto,
  ): UserDetailResponseDto {
    return {
      nickname: user.nickname,
      imgUrl: user.imgUrl,
      level: user.level,
      statusMessage: user.statusMessage,
      title: title,
    };
  }
}
