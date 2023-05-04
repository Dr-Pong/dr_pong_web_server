import { Module } from '@nestjs/common';
import { UsertitleModule } from 'src/user-title/user-title.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { AuthService } from 'src/auth/auth.service';
import { UserEmojiService } from 'src/user-emoji/user-emoji.service';
import { UserTitleService } from 'src/user-title/user-title.service';
import { UserEmojiModule } from 'src/user-emoji/user-emoji.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserAchievementModule } from 'src/user-achievement/user-achievement.module';
import { UserRepository } from './user.repository';
import { ProfileImageRepository } from 'src/profile-image/profile-image.repository';
import { ProfileImage } from 'src/profile-image/profile-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ProfileImage]),
    UsertitleModule,
    UserAchievementModule,
    UserEmojiModule,
    UsertitleModule,
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, ProfileImageRepository],
  exports: [UserService],
})
export class UserModule { }
