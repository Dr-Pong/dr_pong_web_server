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

  //get 유저 현시즌 랭크 데이터
  async getUserRankBySeason(
    getDto: GetUserRankStatDto,
  ): Promise<UserRankStatDto> {
    const userRanks = await this.rankRepository.findOne({
      where: { user: { id: getDto.userId }, season: { id: getDto.seasonId } },
    });

    if (!userRanks) {
      const userRank = null;
      const userRecord = null;
      const responseDto: UserRankStatDto = {
        rank: userRank,
        record: userRecord,
      };
      return responseDto;
    }
    const userRank = userRanks.ladderRank;
    const userRecord = userRanks.ladderPoint;
    const responseDto: UserRankStatDto = {
      rank: userRank,
      record: userRecord,
    };
    return responseDto;
  }

  //유저 시즌 최고점 랭크데이터
  async getUserBestRank(
    getDto: GetUserBestRankStatDto,
  ): Promise<UserRankStatDto> {
    const userRanks = await this.rankRepository.findOne({
      where: { user: { id: getDto.userId } },
      order: { highestRanking: 'ASC' },
    });

    if (!userRanks) {
      const bestRank = null;
      const bestRecord = null;
      const responseDto: UserRankStatDto = {
        rank: bestRank,
        record: bestRecord,
      };
      return responseDto;
    }

    const bestRank = userRanks.highestRanking;
    const bestRecord = userRanks.highestPoint;

    const responseDto: UserRankStatDto = {
      rank: bestRank,
      record: bestRecord,
    };

    return responseDto;
  }
}
