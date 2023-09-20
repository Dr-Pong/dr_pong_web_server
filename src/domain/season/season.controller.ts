import { Controller, Get } from '@nestjs/common';
import { SeasonService } from './season.service';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get('/current')
  async getCurrentSeason(): Promise<{ seasonName: string }> {
    return await this.seasonService.getCurrentSeason();
  }
}
