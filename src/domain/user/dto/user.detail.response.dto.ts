import { UserTitleSelectedDto } from 'src/domain/user-title/dto/user.title.selected.dto';

export class UserDetailResponseDto {
  nickname: string;
  imgUrl: string;
  level: number;
  title: UserTitleSelectedDto;
  statusMessage: string;
}
