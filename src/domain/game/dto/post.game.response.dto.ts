import { UpdateUserAchievementDto } from 'src/domain/user-achievement/dto/update.user.achievement.dto';
import { UpdateUserTitleDto } from 'src/domain/user-title/dto/update.user.title.dto';

export class PostGameResponseDto {
  achievement: UpdateUserAchievementDto[];
  title: UpdateUserTitleDto[];
}
