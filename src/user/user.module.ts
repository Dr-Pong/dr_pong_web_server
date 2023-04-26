import { Module } from '@nestjs/common';
import { UsertitleModule } from 'src/user-title/user-title.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { AuthService } from 'src/auth/auth.service';
import { UserAchievementService } from 'src/user-achievement/user-achievement.service';
import { UserEmojiService } from 'src/user-emoji/user-emoji.service';
import { UserTitleService } from 'src/user-title/user-title.service';
import { UserAchievementModule } from 'src/user-achievement/user-achievement.module';
import { UserEmojiModule } from 'src/user-emoji/user-emoji.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UsertitleModule, TypeOrmModule.forFeature([User]),
    UserAchievementModule,
    UserEmojiModule,
    UsertitleModule,
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
