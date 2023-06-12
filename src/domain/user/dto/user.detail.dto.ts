import { ProfileImageDto } from 'src/domain/profile-image/dto/profile-image.dto';

export class UserDetailDto {
  nickname: string;

  image: ProfileImageDto;

  level: number;

  statusMessage: string;
}
