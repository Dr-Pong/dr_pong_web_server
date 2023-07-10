import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domain/user/user.entity';
import { Title } from 'src/domain/title/title.entity';
import { UserTitle } from 'src/domain/user-title/user-title.entity';
import { Rank } from 'src/domain/rank/rank.entity';
import { Season } from 'src/domain/season/season.entity';
import { Game } from 'src/domain/game/game.entity';
import { Achievement } from 'src/domain/achievement/achievement.entity';
import { Emoji } from 'src/domain/emoji/emoji.entity';
import { UserEmoji } from 'src/domain/user-emoji/user-emoji.entity';
import { UserAchievement } from 'src/domain/user-achievement/user-achievement.entity';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import { UserGame } from 'src/domain/user-game/user-game.entity';
import { AuthModule } from 'src/domain/auth/auth.module';
import { TouchLog } from 'src/domain/touch-log/touch.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Title,
      UserTitle,
      Rank,
      Season,
      Game,
      Achievement,
      UserAchievement,
      Emoji,
      UserEmoji,
      ProfileImage,
      UserGame,
      TouchLog,
    ]),
    AuthModule,
  ],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}
