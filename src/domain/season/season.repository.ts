import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season } from './season.entity';

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

  async save(name: string): Promise<Season> {
    return this.repository.save({
      name,
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 - 1),
    });
  }
}
