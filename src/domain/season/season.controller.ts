import { Controller, Get } from '@nestjs/common';
import { SeasonService } from './season.service';

@Controller('season')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get('/current')
  async getCurrentSeason(): Promise<{ name: string }> {
    return await this.seasonService.getCurrentSeason();
  }
}
