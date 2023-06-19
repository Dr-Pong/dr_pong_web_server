import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ProfileImageRepository } from './domain/profile-image/profile-image.repository';
import { ProfileImage } from './domain/profile-image/profile-image.entity';
import { SeasonRepository } from './domain/season/season.repository';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private imageRepository: ProfileImageRepository,
    private readonly seasonRepository: SeasonRepository,
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
  }

  getHello(): string {
    return 'Hello World!';
  }
}
