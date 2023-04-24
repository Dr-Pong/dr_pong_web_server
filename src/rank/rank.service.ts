import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rank } from './rank.entity';
import { Season } from 'src/season/season.entity';
import { GetUserRankStatDto } from './dto/get.user.rank.stat.dto';
import { UserRankStatDto } from './dto/user.rank.stat.dto';
import { GetUserBestRankStatDto } from './dto/get.user.best.rnak.stat.dto';

@Injectable()
export class RankService {
  constructor(
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
    @InjectRepository(Rank)
    private rankRepository: Repository<Rank>,
  ) {}
  //get
  async getUserRankBySeason(
    getDto: GetUserRankStatDto,
  ): Promise<UserRankStatDto> {
    const userRanks = await this.rankRepository.findOne({
      where: { user: { id: getDto.userId }, season: { id: getDto.seasonId } },
    });
    if (!userRanks) {
      throw new BadRequestException('No Rank Data');
    }
    const userRank = userRanks.ladderRank;
    const userRecord = userRanks.ladderPoint;
    const responseDto: UserRankStatDto = {
      rank: userRank,
      record: userRecord,
    };
    return responseDto;
  }

  async getUserBestRank(
    getDto: GetUserBestRankStatDto,
  ): Promise<UserRankStatDto> {
    const userRanks = await this.rankRepository.find({
      where: { user: { id: getDto.userId } },
      order: { highestRanking: 'ASC' },
    });

    if (!userRanks || userRanks.length === 0) {
      throw new BadRequestException('No BEST Rank Data');
    }

    const bestRank = userRanks[0].highestRanking;
    const bestRecord = userRanks[0].highestPoint;

    const responseDto: UserRankStatDto = {
      rank: bestRank,
      record: bestRecord,
    };

    return responseDto;
  }
}
