import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ProfileImageRepository } from './domain/profile-image/profile-image.repository';
import { ProfileImage } from './domain/profile-image/profile-image.entity';
import { SeasonRepository } from './domain/season/season.repository';
import { UserRepository } from './domain/user/user.repository';
import { EmojiRepository } from './domain/emoji/emoji.repository';
import { UserEmojiRepository } from './domain/user-emoji/user-emoji.repository';
import { TitleRepository } from './domain/title/title.repository';
import { UserTitleRepository } from './domain/user-title/user-title.repository';
import { AchievementRepository } from './domain/achievement/achievement.repository';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private imageRepository: ProfileImageRepository,
    private readonly seasonRepository: SeasonRepository,
    private readonly userRepository: UserRepository,
    private readonly emojiRepository: EmojiRepository,
    private readonly userEmojiRepository: UserEmojiRepository,
    private readonly titleRepository: TitleRepository,
    private readonly userTitleRepository: UserTitleRepository,
    private readonly achievementRepository: AchievementRepository,
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
    const titles = await this.titleRepository.findAll();
    if (titles.length === 0) {
      await this.titleRepository.save(1, 'pisciner', '10레벨 달성');
      await this.titleRepository.save(2, 'cadet', '42레벨 달성');
      await this.titleRepository.save(3, 'member', '100레벨 달성');

      const users = await this.userRepository.findAll();
      for (const c of users) {
        await this.userTitleRepository.save(c.id, titles[0].id);
        await this.userTitleRepository.save(c.id, titles[1].id);
        await this.userTitleRepository.save(c.id, titles[2].id);
      }
    }

    const achievements = await this.achievementRepository.findAll();
    if (achievements.length === 0) {
      await this.achievementRepository.save(
        1,
        'seahorse',
        'first victory',
        'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/junyopar.jpeg',
      );
      await this.achievementRepository.save(
        2,
        'octopus',
        '8th victory',
        'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/daekim.jpeg',
      );
      await this.achievementRepository.save(
        3,
        'squid',
        '10th victory',
        'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/jabae.jpeg',
      );
      await this.achievementRepository.save(
        4,
        'hatch',
        'reached student tier',
        'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/him.jpeg',
      );
      await this.achievementRepository.save(
        5,
        'summa cum laude',
        'reached bachelor tier',
        'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/jaekim.jpeg',
      );
      await this.achievementRepository.save(
        6,
        'transcendence',
        'reached master tier',
        'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/jaemjung.jpeg',
      );
      await this.achievementRepository.save(
        7,
        'dr.pong',
        'reached doctor tier',
        'https://42gg-public-image.s3.ap-northeast-2.amazonaws.com/images/jujeon.jpeg',
      );
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
