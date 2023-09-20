import { Injectable } from '@nestjs/common';
import { SeasonRepository } from './season.repository';
import { Cron } from '@nestjs/schedule';
import { UserRepository } from '../user/user.repository';
import { Season } from './season.entity';
import { User } from '../user/user.entity';
import { RankRepository } from '../rank/rank.repository';

@Injectable()
export class SeasonService {
  constructor(
    private readonly seasonRepository: SeasonRepository,
    private readonly userRepository: UserRepository,
    private readonly rankRepository: RankRepository,
  ) {}

  @Cron('0 0 0 * * MON')
  async createSeason(): Promise<void> {
    const newSeason: Season = await this.seasonRepository.save();
    const users: User[] = await this.userRepository.findAll();
    for (const user of users) {
      await this.rankRepository.save(user.id, newSeason.id);
    }
  }

  async getCurrentSeason(): Promise<{ name: string }> {
    return { name: (await this.seasonRepository.findCurrentSeason()).name };
  }
}
