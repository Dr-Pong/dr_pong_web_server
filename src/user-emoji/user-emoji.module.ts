import { Module } from '@nestjs/common';
import { UserEmojiService } from './user-emoji.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Emoji } from 'src/emoji/emoji.entity';
import { UserEmoji } from './user-emoji.entity';
import { UserModule } from 'src/user/user.module';
import { EmojiModule } from 'src/emoji/emoji.module';
import { UserEmojiRepository } from './user-emoji.repository';
import { EmojiRepository } from 'src/emoji/emoji.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEmoji, Emoji])],
  providers: [UserEmojiService, UserEmojiRepository, EmojiRepository],
  exports: [UserEmojiService],
})
export class UserEmojiModule {}
