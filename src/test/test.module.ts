import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Title } from 'src/title/title.entity';
import { UserTitle } from 'src/user-title/user-title.entity';
import { Rank } from 'src/rank/rank.entity';
import { Season } from 'src/season/season.entity';
import { Game } from 'src/game/game.entity';
import { Achievement } from 'src/achievement/achievement.entity';
import { Emoji } from 'src/emoji/emoji.entity';
import { UserEmoji } from 'src/user-emoji/user-emoji.entity';
import { UserAchievement } from 'src/user-achievement/user-achievement.entity';
import { ProfileImage } from 'src/profile-image/profile-image.entity';
import { UserGame } from 'src/user-game/user-game.entity';

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
      UserGame
    ]),
  ],
  providers: [TestService],
  exports: [
    TestService,
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
      UserGame
    ]),
  ],
})
export class TestModule { }
