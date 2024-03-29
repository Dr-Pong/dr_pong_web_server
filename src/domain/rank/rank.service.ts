import { Injectable } from '@nestjs/common';
import { Season } from 'src/domain/season/season.entity';
import { GetUserRankStatDto } from './dto/get.user.rank.stat.dto';
import { GetUserBestRankStatDto } from './dto/get.user.best.rank.stat.dto';
import { RankRepository } from './rank.repository';
import { SeasonRepository } from 'src/domain/season/season.repository';
import { GetRanksTopDto } from './dto/get.ranks.top.count.dto';
import { RankTopDataDto, RanksTopDto } from './dto/ranks.top.dto';
import { GetRanksBottomDto } from './dto/get.ranks.bottom.dto';
import { RankBottomDataDto, RanksBottomDto } from './dto/ranks.bottom.dto';
import { RankSeasonStatDto } from './dto/rank.season.stat.dto';
import { RankBestStatDto } from './dto/rank.best.stat.dto';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { GetRankLpAndImageDto } from './dto/get.rank.lp.and.image.dto';
import { RankLpAndkImageResponseDto } from './dto/rank.lp.and.image.response.dto';
import { Rank } from './rank.entity';
import { UserRepository } from '../user/user.repository';
import { User } from '../user/user.entity';

@Injectable()
export class RankService {
  constructor(
    private readonly rankRepository: RankRepository,
    private readonly seasonRepository: SeasonRepository,
    private readonly userRepository: UserRepository,
  ) {}

  //get 유저 현시즌 랭크 데이터
  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async getUserRankBySeason(
    getDto: GetUserRankStatDto,
  ): Promise<RankSeasonStatDto> {
    const currentseason = await this.seasonRepository.findCurrentSeason();
    const userRanks = await this.rankRepository.findByUserIdAndSeasonId(
      getDto.userId,
      currentseason.id,
    );

    if (!userRanks) {
      return RankBestStatDto.eggUser();
    }

    if (userRanks.ladderPoint >= Number(process.env.DOCTOR_CUT)) {
      const userRank = await this.rankRepository.findRankingByUserIdAndSeasonId(
        getDto.userId,
        currentseason.id,
      );
      return RankBestStatDto.doctorUser(userRanks.ladderPoint, userRank);
    } else {
      return RankBestStatDto.nonDoctorUser(userRanks.ladderPoint);
    }
  }

  /** 유저 최고 record rank tier반환*/
  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
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
      return RankBestStatDto.doctorUser(userRanks.highestPoint, null);
    } else {
      return RankBestStatDto.nonDoctorUser(userRanks.highestPoint);
    }
  }

  //상위 랭크 카운트 만큼 랭크 정보를 가져옴
  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
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
        imgUrl: rank.user.image.url,
      });
    }

    const responseDto: RanksTopDto = {
      top: topRankData,
    };
    return responseDto;
  }

  // 하위 랭크 카운트 만큼 랭크 정보를 가져옴
  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
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

  async getRankLpAndImageByUserId(
    getDto: GetRankLpAndImageDto,
  ): Promise<RankLpAndkImageResponseDto> {
    const nowSeason: Season = await this.seasonRepository.findCurrentSeason();
    const user: User = await this.userRepository.findById(getDto.userId);
    const userRank: Rank = await this.rankRepository.findByUserIdAndSeasonId(
      getDto.userId,
      nowSeason.id,
    );

    const responseDto: RankLpAndkImageResponseDto = {
      lp: userRank.ladderPoint,
      profileImgUrl: user.image.url,
    };
    return responseDto;
  }
}
