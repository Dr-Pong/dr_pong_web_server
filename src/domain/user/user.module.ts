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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ProfileImage, Season, Rank]),
    UsertitleModule,
    UserAchievementModule,
    UserEmojiModule,
    UsertitleModule,
    RankModule,
    UserGameModule,
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
  ],
  exports: [UserService],
})
export class UserModule {}
