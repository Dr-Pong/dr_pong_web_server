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
import { GetRanksTopDto } from './dto/get.ranks.top.count.dto';
import { RankTopDataDto, RanksTopDto } from './dto/ranks.top.dto';
import { GetRanksTopImageDto } from './dto/get.ranks.top.image.dto';
import { GetRanksBottomDto } from './dto/get.ranks.bottom.dto';
import { RankBottomDataDto, RanksBottomDto } from './dto/ranks.bottom.dto';

@Injectable()
export class RankService {
  constructor(
    private rankRepository: RankRepository,
    private seasonRepository: SeasonRepository,
  ) {}

  //get 유저 현시즌 랭크 데이터
  async getUserRankBySeason(
    getDto: GetUserRankStatDto,
  ): Promise<UserRankStatDto> {
    const userRanks = await this.rankRepository.findByUserIdAndSeasonId(
      getDto.userId,
      getDto.seasonId,
    );

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
    const userRanks = await this.rankRepository.findHighestRankByUserId(
      getDto.userId,
    );

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

  //상위 랭크 카운트 만큼 랭크 정보를 가져옴
  async getTopRanksByCount(getDto: GetRanksTopDto): Promise<RanksTopDto> {
    const nowSeason: Season = await this.seasonRepository.findCurrentSeason();
    const ranks = await this.rankRepository.findTopRanksByCount(
      getDto,
      nowSeason,
    );

    const topRankData: RankTopDataDto[] = [];
    for (let i = 0; i < ranks.length; i++) {
      const rank = ranks[i];
      topRankData.push({
        id: rank.user.id,
        rank: i + 1, // 1을 더해서 순위를 계산
        nickname: rank.user.nickname,
        ladderPoint: rank.ladderPoint,
        image: rank.user.imageUrl,
      });
    }

    const responseDto: RanksTopDto = {
      top: topRankData,
    };
    return responseDto;
  }

  // 하위 랭크 카운트 만큼 랭크 정보를 가져옴
  async getBottomRanksByCount(
    getDto: GetRanksBottomDto,
  ): Promise<RanksBottomDto> {
    const nowSeason: Season = await this.seasonRepository.findCurrentSeason();
    const ranks = await this.rankRepository.findBottomRanksByCount(
      getDto,
      nowSeason,
    );

    const bottomRankData: RankBottomDataDto[] = [];
    for (let i = 0; i < ranks.length; i++) {
      const rank = ranks[i];
      bottomRankData.push({
        id: rank.user.id,
        rank: getDto.offset + i + 1,
        nickname: rank.user.nickname,
        ladderPoint: rank.ladderPoint,
      });
    }

    const responseDto: RanksBottomDto = {
      bottom: bottomRankData,
    };
    return responseDto;
  }
}
