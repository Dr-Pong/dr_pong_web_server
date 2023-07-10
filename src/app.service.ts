import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ProfileImageRepository } from './domain/profile-image/profile-image.repository';
import { ProfileImage } from './domain/profile-image/profile-image.entity';
import { SeasonRepository } from './domain/season/season.repository';
import { UserRepository } from './domain/user/user.repository';
import { EmojiRepository } from './domain/emoji/emoji.repository';
import { UserEmojiRepository } from './domain/user-emoji/user-emoji.repository';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private imageRepository: ProfileImageRepository,
    private readonly seasonRepository: SeasonRepository,
    private readonly userRepository: UserRepository,
    private readonly emojiRepository: EmojiRepository,
    private readonly userEmojiRepository: UserEmojiRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const images: ProfileImage[] = await this.imageRepository.findAll();
    if (images.length === 0) {
      await this.imageRepository.save(
        {
          id: 1,
          url: 'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/kipark.jpeg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          url: 'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/jihyukim.jpeg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          url: 'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/nheo.jpeg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          url: 'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/hakim.jpeg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    }
    const season = await this.seasonRepository.findCurrentSeason();
    if (!season)
      await this.seasonRepository.save({
        id: 1,
        name: 'season1',
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
      });

    const emojis = await this.emojiRepository.findAll();
    if (emojis.length === 0) {
      await this.emojiRepository.save(
        'emoji1',
        'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/jaehwkim.jpeg',
      );
      await this.emojiRepository.save(
        'emoji2',
        'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/jiyun.jpeg',
      );
      await this.emojiRepository.save(
        'emoji3',
        'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/sumsong.jpeg',
      );
      await this.emojiRepository.save(
        'emoji4',
        'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/keokim.jpeg',
      );
    }
    const savedEmojis = await this.emojiRepository.findAll();
    if (emojis.length === 0) {
      const users = await this.userRepository.findAll();
      for (const c of users) {
        for (const d of savedEmojis) {
          await this.userEmojiRepository.save(c.id, d.id);
        }
      }
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
