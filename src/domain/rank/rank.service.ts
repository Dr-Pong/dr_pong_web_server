import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rank } from './rank.entity';
import { Season } from 'src/domain/season/season.entity';
import { GetUserRankStatDto } from './dto/get.user.rank.stat.dto';
import { UserRankStatDto } from './dto/user.rank.stat.dto';
import { GetUserBestRankStatDto } from './dto/get.user.best.rank.stat.dto';
import { RankRepository } from './rank.repository';
import { SeasonRepository } from 'src/domain/season/season.repository';
import { GetRanksTopDto } from './dto/get.ranks.top.count.dto';
import { RankTopDataDto, RanksTopDto } from './dto/ranks.top.dto';
import { GetRanksTopImageDto } from './dto/get.ranks.top.image.dto';
import { GetRanksBottomDto } from './dto/get.ranks.bottom.dto';
import { RankBottomDataDto, RanksBottomDto } from './dto/ranks.bottom.dto';
import { RankSeasonStatDto } from './dto/rank.season.stat.dto';
import { RankBestStatDto } from './dto/rank.best.stat.dto';
import dotenv from 'dotenv';
import {
  TIER_BACHELOR,
  TIER_DOCTOR,
  TIER_MASTER,
  TIER_STUDENT,
} from 'src/global/type/type.tier';

@Injectable()
export class RankService {
  constructor(
    private rankRepository: RankRepository,
    private seasonRepository: SeasonRepository,
  ) { }

  //get 유저 현시즌 랭크 데이터
  async getUserRankBySeason(
    getDto: GetUserRankStatDto,
  ): Promise<RankSeasonStatDto> {
    const userRanks = await this.rankRepository.findByUserIdAndSeasonId(
      getDto.userId,
      getDto.seasonId,
    );

    if (!userRanks) {
      return RankBestStatDto.eggUser();
    }

    if (userRanks.ladderPoint >= Number(process.env.DOCTOR_CUT)) {
      const userRank = await this.rankRepository.findRankByLadderPoint(
        userRanks.ladderPoint,
      );
      return RankBestStatDto.doctorUser(userRanks.ladderPoint, userRank);
    } else {
      return RankBestStatDto.nonDoctorUser(userRanks.ladderPoint);
    }
  }

  /** 유저 최고 record rank tier반환*/
  async getUserBestRank(
    getDto: GetUserBestRankStatDto,
  ): Promise<RankBestStatDto> {
    const userRanks = await this.rankRepository.findHighestRankByUserId(
      getDto.userId,
    );

    if (!userRanks) {
      return RankBestStatDto.eggUser();
    }

    if (userRanks.highestPoint >= Number(process.env.DOCTOR_CUT)) {
      const userRank = await this.rankRepository.findRankByLadderPoint(
        userRanks.highestPoint,
      );
      return RankBestStatDto.doctorUser(userRanks.highestPoint, userRank);
    } else {
      return RankBestStatDto.nonDoctorUser(userRanks.highestPoint);
    }
  }

  //상위 랭크 카운트 만큼 랭크 정보를 가져옴
  async getTopRanksByCount(getDto: GetRanksTopDto): Promise<RanksTopDto> {
    const nowSeason: Season = await this.seasonRepository.findCurrentSeason();
    const ranks = await this.rankRepository.findTopRanksBySeason(
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
        lp: rank.ladderPoint,
        imageUrl: rank.user.image.url,
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
    const ranks = await this.rankRepository.findBottomRanksBySeason(
      getDto,
      nowSeason,
    );

    const bottomRankData: RankBottomDataDto[] = [];
    for (let i = 0; i < ranks.length; i++) {
      const rank = ranks[i];
      bottomRankData.push({
        id: rank.user.id,
        rank: getDto.offset + i,
        nickname: rank.user.nickname,
        lp: rank.ladderPoint,
      });
    }

    const responseDto: RanksBottomDto = {
      bottom: bottomRankData,
    };
    return responseDto;
  }
}
