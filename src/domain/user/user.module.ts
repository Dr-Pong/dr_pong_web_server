import { Module } from '@nestjs/common';
import { UsertitleModule } from 'src/domain/user-title/user-title.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserEmojiService } from 'src/domain/user-emoji/user-emoji.service';
import { UserTitleService } from 'src/domain/user-title/user-title.service';
import { UserEmojiModule } from 'src/domain/user-emoji/user-emoji.module';
import { UserAchievementModule } from 'src/domain/user-achievement/user-achievement.module';
import { UserRepository } from './user.repository';
import { ProfileImageRepository } from 'src/domain/profile-image/profile-image.repository';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import { RankModule } from 'src/domain/rank/rank.module';
import { UserGameModule } from '../user-game/user-game.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ProfileImage]),
    UsertitleModule,
    UserAchievementModule,
    UserEmojiModule,
    UsertitleModule,
    RankModule,
    UserGameModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, ProfileImageRepository],
  exports: [UserService],
})
export class UserModule { }
