import { UpdateUserAchievementsDto } from 'src/domain/user-achievement/dto/update.user.achievement.dto';
import { UpdateUserTitlesDto } from 'src/domain/user-title/dto/update.user.title.dto';

export class PostGameResponseDto {
  achievement: UpdateUserAchievementsDto;
  title: UpdateUserTitlesDto;
}
