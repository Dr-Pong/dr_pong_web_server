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
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/1.svg',
      );
      await this.emojiRepository.save(
        'emoji2',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/2.svg',
      );
      await this.emojiRepository.save(
        'emoji3',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/3.svg',
      );
      await this.emojiRepository.save(
        'emoji4',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/4.svg',
      );
      await this.emojiRepository.save(
        'emoji5',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/5.svg',
      );
      await this.emojiRepository.save(
        'emoji6',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/6.svg',
      );
      await this.emojiRepository.save(
        'emoji7',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/7.svg',
      );
      await this.emojiRepository.save(
        'emoji8',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/8.svg',
      );
      await this.emojiRepository.save(
        'emoji9',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/9.svg',
      );
      await this.emojiRepository.save(
        'emoji10',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/10.svg',
      );
      await this.emojiRepository.save(
        'emoji11',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/11.svg',
      );
      await this.emojiRepository.save(
        'emoji12',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/12.svg',
      );
      await this.emojiRepository.save(
        'emoji13',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/13.svg',
      );
      await this.emojiRepository.save(
        'emoji14',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/14.svg',
      );
      await this.emojiRepository.save(
        'emoji15',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/15.svg',
      );
      await this.emojiRepository.save(
        'emoji16',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/16.svg',
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
        'seahorse',
        'first victory',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/achievements/Seahorse.svg',
      );
      await this.achievementRepository.save(
        'octopus',
        '8th victory',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/achievements/Octopus.svg',
      );
      await this.achievementRepository.save(
        'squid',
        '10th victory',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/achievements/Squid.svg',
      );
      await this.achievementRepository.save(
        'hatch',
        'reached student tier',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/achievements/Hatched.svg',
      );
      await this.achievementRepository.save(
        'summa cum laude',
        'reached bachelor tier',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/achievements/Summa+Pong+Laude.svg',
      );
      await this.achievementRepository.save(
        'transcendence',
        'reached master tier',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/achievements/Transcendence.svg',
      );
      await this.achievementRepository.save(
        'dr.pong',
        'reached doctor tier',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/achievements/Dr.Pong.svg',
      );
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
