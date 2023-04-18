import { Module } from '@nestjs/common';
import { UserEmojiService } from './user-emoji.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Emoji } from 'src/emoji/emoji.entity';
import { UserEmoji } from './user-emoji.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserEmoji, Emoji])],
  providers: [UserEmojiService],
  exports: [TypeOrmModule.forFeature([UserEmoji]), UserEmojiService],
})
export class UserEmojiModule {}
