import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rank } from './rank.entity';
import { Season } from 'src/season/season.entity';
import { GetUserRankStatDto } from './dto/get.user.rank.stat.dto';
import { UserRankStatDto } from './dto/user.rank.stat.dto';
import { GetUserBestRankStatDto } from './dto/get.user.best.rnak.stat.dto';
import { RankRepository } from './rank.repository';
import { SeasonRepository } from 'src/season/season.repository';

@Injectable()
export class RankService {
  constructor(
    @InjectRepository(Season)
    private seasonRepository: SeasonRepository,
    @InjectRepository(Rank)
    private rankRepository: RankRepository,
  ) {}

  //get 유저 현시즌 랭크 데이터
  async getUserRankBySeason(
    getDto: GetUserRankStatDto,
  ): Promise<UserRankStatDto> {
    const currentSeason = await this.seasonRepository.findCurrentSeason();
    const userRanks = await this.rankRepository.findByUserIdAndSeasonId(getDto.userId, currentSeason.id);

    if (!userRanks) {
      const responseDto: UserRankStatDto = {
        record: null,
      };
      return responseDto;
    }
    const responseDto: UserRankStatDto = {
      record: userRanks.ladderPoint,
    };
    return responseDto;
  }

  //유저 시즌 최고점 랭크데이터
  async getUserBestRank(
    getDto: GetUserBestRankStatDto,
  ): Promise<UserRankStatDto> {
    const userRanks = await this.rankRepository.findHighestRankByUserId(getDto.userId);

    if (!userRanks) {
      const responseDto: UserRankStatDto = {
        record: null,
      };
      return responseDto;
    }

    const responseDto: UserRankStatDto = {
      record: userRanks.highestPoint,
    };
    return responseDto;
  }
}
