import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season } from './season.entity';
import { getWeekNumber } from 'src/global/utils/week.calculator';

@Injectable()
export class SeasonRepository {
  constructor(
    @InjectRepository(Season)
    private readonly repository: Repository<Season>,
  ) {}

  async findCurrentSeason(): Promise<Season> {
    return (
      await this.repository.find({
        order: { id: 'DESC' },
        take: 1,
      })
    )[0];
  }

  async save(name?: string): Promise<Season> {
    const date: Date = new Date();

    return await this.repository.save({
      name:
        name ?? (date.getMonth() + 1).toString() + '-' + getWeekNumber(date),
      startTime: date,
      endTime: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000 - 1),
    });
  }
}
