import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rank } from './rank.entity';
import { GetRanksTopDto } from './dto/get.ranks.top.count.dto';
import { GetRanksBottomDto } from './dto/get.ranks.bottom.dto';
import { Season } from 'src/season/season.entity';

@Injectable()
export class RankRepository {
  constructor(
    @InjectRepository(Rank)
    private readonly repository: Repository<Rank>,
  ) {}

  async findByUserIdAndSeasonId(
    userId: number,
    seasonId: number,
  ): Promise<Rank> {
    return await this.repository.findOne({
      where: { user: { id: userId }, season: { id: seasonId } },
    });
  }

  async findHighestRankByUserId(userId: number): Promise<Rank> {
    return await this.repository.findOne({
      where: { user: { id: userId } },
      order: { highestPoint: 'ASC' },
    });
  }

  async findTopRanksByCount(
    getDto: GetRanksTopDto,
    nowSeason: Season,
  ): Promise<Rank[]> {
    return await this.repository.find({
      where: { season: { id: nowSeason.id } },
      take: getDto.count,
      order: { ladderPoint: 'DESC' },
    });
  }

  async findBottomRanksByCount(
    getDto: GetRanksBottomDto,
    nowSeason: Season,
  ): Promise<Rank[]> {
    return await this.repository.find({
      where: { season: { id: nowSeason.id } },
      take: getDto.count,
      skip: getDto.offset,
      order: { ladderPoint: 'DESC' },
    });
  }
}
