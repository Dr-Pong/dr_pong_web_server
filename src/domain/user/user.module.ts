import { Module } from '@nestjs/common';
import { UsertitleModule } from 'src/domain/user-title/user-title.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserEmojiModule } from 'src/domain/user-emoji/user-emoji.module';
import { UserAchievementModule } from 'src/domain/user-achievement/user-achievement.module';
import { UserRepository } from './user.repository';
import { ProfileImageRepository } from 'src/domain/profile-image/profile-image.repository';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import { RankModule } from 'src/domain/rank/rank.module';
import { UserGameModule } from '../user-game/user-game.module';
import { UserDetailsController } from './controller/user.details.controller';
import { UserRanksController } from './controller/user.ranks.controller';
import { UserRecordsController } from './controller/user.records.controller';
import { UserStatsController } from './controller/user.stats.controller';
import { UserCollectablesController } from './controller/user.collectables.controller';
import { UserGatewayController } from './controller/user.gateway.controller';
import { Season } from '../season/season.entity';
import { Rank } from '../rank/rank.entity';
import { SeasonRepository } from '../season/season.repository';
import { RankRepository } from '../rank/rank.repository';
import { EmojiModule } from '../emoji/emoji.module';
import { UserEmojiRepository } from '../user-emoji/user-emoji.repository';
import { EmojiRepository } from '../emoji/emoji.repository';
import { Emoji } from '../emoji/emoji.entity';
import { UserEmoji } from '../user-emoji/user-emoji.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ProfileImage, Season, Rank, Emoji, UserEmoji]),
    UsertitleModule,
    UserAchievementModule,
    UserEmojiModule,
    UsertitleModule,
    RankModule,
    UserGameModule,
    EmojiModule,
  ],
  controllers: [
    UserCollectablesController,
    UserDetailsController,
    UserRanksController,
    UserRecordsController,
    UserStatsController,
    UserGatewayController,
  ],
  providers: [
    UserService,
    UserRepository,
    ProfileImageRepository,
    SeasonRepository,
    RankRepository,
    UserEmojiRepository,
    EmojiRepository,
  ],
  exports: [UserService],
})
export class UserModule {}
