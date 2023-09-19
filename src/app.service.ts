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
      for (let i = 1; i <= 8; i++) {
        await this.imageRepository.save({
          id: i,
          url:
            'https://drpong.s3.ap-northeast-2.amazonaws.com/fishes/' +
            i.toString() +
            '.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    const season = await this.seasonRepository.findCurrentSeason();
    if (!season) await this.seasonRepository.save('season1');

    const emojis = await this.emojiRepository.findAll();
    if (emojis.length === 0) {
      for (let i = 1; i <= 16; i++) {
        await this.emojiRepository.save(
          'emoji' + i.toString(),
          'https://drpong.s3.ap-northeast-2.amazonaws.com/emojis/' +
            i.toString() +
            '.svg',
        );
      }
    }
    const savedEmojis = await this.emojiRepository.findAll();
    if (emojis.length === 0) {
      const users = await this.userRepository.findAll();
      for (const c of users) {
        for (const d of savedEmojis) {
          if (d.id <= 4)
            await this.userEmojiRepository.save(c.id, d.id, d.id - 1);
          else await this.userEmojiRepository.save(c.id, d.id, null);
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
        'drpong',
        'reached doctor tier',
        'https://drpong.s3.ap-northeast-2.amazonaws.com/achievements/Dr.Pong.svg',
      );
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
