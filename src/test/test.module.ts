import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Title } from 'src/title/title.entity';
import { UserTitle } from 'src/user-title/user-title.entity';
import { Rank } from 'src/rank/rank.entity';
import { Season } from 'src/season/season.entity';
import { Game } from 'src/game/game.entity';
import { Achievemet } from 'src/achievemet/achievement.entity';
import { Emoji } from 'src/emoji/emoji.entity';
import { UserEmoji } from 'src/user-emoji/user-emoji.entity';
import { UserAchievement } from 'src/user-achievement/user-achievement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Title, UserTitle, Rank, Season, Game, Achievemet, UserAchievement, Emoji, UserEmoji])],
  providers: [TestService],
  exports: [TestService, TypeOrmModule.forFeature([User, Title, UserTitle, Rank, Season, Game, Achievemet, UserAchievement, Emoji, UserEmoji])],
})
export class TestModule {}
