import { Module } from '@nestjs/common';
import { UserEmojiService } from './user-emoji.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domain/user/user.entity';
import { Emoji } from 'src/domain/emoji/emoji.entity';
import { UserEmoji } from './user-emoji.entity';
import { UserModule } from 'src/domain/user/user.module';
import { EmojiModule } from 'src/domain/emoji/emoji.module';
import { UserEmojiRepository } from './user-emoji.repository';
import { EmojiRepository } from 'src/domain/emoji/emoji.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEmoji, Emoji])],
  providers: [UserEmojiService, UserEmojiRepository, EmojiRepository],
  exports: [UserEmojiService],
})
export class UserEmojiModule { }
