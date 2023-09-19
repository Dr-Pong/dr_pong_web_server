import { Injectable } from '@nestjs/common';
import { SeasonRepository } from './season.repository';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SeasonService {
  constructor(private readonly seasonRepository: SeasonRepository) {}

  @Cron('0 0 0 * * MON')
  async createSeason(): Promise<void> {
    const season = await this.seasonRepository.findCurrentSeason();
    await this.seasonRepository.save(
      season?.name ?? 'season' + (season?.id ?? 0 + 1).toString(),
    );
  }
}
