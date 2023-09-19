import { Injectable } from '@nestjs/common';
import { SeasonRepository } from './season.repository';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SeasonService {
  constructor(private readonly seasonRepository: SeasonRepository) {}

  @Cron('0 0 0 * * MON')
  async createSeason(): Promise<void> {
    await this.seasonRepository.save();
  }
}
