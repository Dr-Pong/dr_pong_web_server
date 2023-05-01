import { UserTitleSelectedDto } from 'src/user-title/dto/user.title.selected.dto';

export class UserDetailResponseDto {
  nickname: string;
  imgUrl: string;
  level: number;
  title: UserTitleSelectedDto;
  statusMessage: string;
}
